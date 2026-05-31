import { Hono } from "hono";
import { eq, and, sql } from "drizzle-orm";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { db } from "../database";
import * as schema from "../database/schema";
import { requireAuth } from "../middleware/auth";
import { s3, CERT_BUCKET, ALLOWED_MIME, mimeToFileType, certDocKey } from "../lib/s3";

type Variables = {
  user: { id: string; name: string; email: string } | null;
  session: unknown | null;
};

const app = new Hono<{ Variables: Variables }>();

// ─── Apply auth to all routes ─────────────────────────────────
app.use("*", requireAuth);

// ─────────────────────────────────────────────────────────────
// SPECIALTIES CATALOG
// ─────────────────────────────────────────────────────────────

/** GET /api/specialties — list all active specialties with my cert status */
app.get("/", async (c) => {
  const user = c.get("user")!;

  const specialties = await db
    .select()
    .from(schema.radionicsSpecialties)
    .where(eq(schema.radionicsSpecialties.isActive, true))
    .orderBy(schema.radionicsSpecialties.name);

  // Fetch this therapist's certifications in one query
  const certs = await db
    .select()
    .from(schema.therapistSpecialtyCertifications)
    .where(eq(schema.therapistSpecialtyCertifications.therapistId, user.id));

  const certMap = new Map(certs.map((c) => [c.specialtyId, c]));

  // Count tools per specialty (from radionics_tables methodology if slug matches)
  // For now returning toolCount=0 — wire to radionics_tools later
  const result = specialties.map((s) => {
    const cert = certMap.get(s.id);
    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: s.description ?? undefined,
      category: s.category ?? undefined,
      imageUrl: s.imageUrl ?? undefined,
      requiresCertification: s.requiresCertification,
      isActive: s.isActive,
      toolCount: 0,
      certificationStatus: cert?.status ?? "not_certified",
      certificationId: cert?.id ?? undefined,
    };
  });

  return c.json({ specialties: result }, 200);
});

/** POST /api/specialties — admin only: create specialty */
app.post("/", async (c) => {
  const body = await c.req.json();
  const { name, slug, description, category, requiresCertification } = body;
  if (!name || !slug) return c.json({ message: "name and slug required" }, 400);

  const [spec] = await db
    .insert(schema.radionicsSpecialties)
    .values({ name, slug, description, category, requiresCertification: requiresCertification ?? true })
    .returning();

  return c.json({ specialty: spec }, 201);
});

// ─────────────────────────────────────────────────────────────
// SPECIALTY REQUESTS
// ─────────────────────────────────────────────────────────────

/** GET /api/specialties/requests — my requests + (if admin) all pending */
app.get("/requests", async (c) => {
  const user = c.get("user")!;

  const myRequests = await db
    .select()
    .from(schema.radonicsSpecialtyRequests)
    .where(eq(schema.radonicsSpecialtyRequests.therapistId, user.id))
    .orderBy(sql`${schema.radonicsSpecialtyRequests.submittedAt} DESC`);

  return c.json({ requests: myRequests }, 200);
});

/** GET /api/specialties/requests/all — admin: all pending requests */
app.get("/requests/all", async (c) => {
  const allRequests = await db
    .select()
    .from(schema.radonicsSpecialtyRequests)
    .orderBy(sql`${schema.radonicsSpecialtyRequests.submittedAt} DESC`);

  return c.json({ requests: allRequests }, 200);
});

/** POST /api/specialties/requests — propose a new specialty */
app.post("/requests", async (c) => {
  const user = c.get("user")!;
  const body = await c.req.json();
  const { proposedName, proposedSlug, description, category, notes } = body;
  if (!proposedName) return c.json({ message: "proposedName required" }, 400);

  const [req] = await db
    .insert(schema.radonicsSpecialtyRequests)
    .values({
      therapistId: user.id,
      proposedName,
      proposedSlug: proposedSlug ?? undefined,
      description: description ?? undefined,
      category: category ?? undefined,
      notes: notes ?? undefined,
      status: "pending_review",
    })
    .returning();

  return c.json({ request: req }, 201);
});

/** PATCH /api/specialties/requests/:id/review — admin: approve or reject */
app.patch("/requests/:id/review", async (c) => {
  const user = c.get("user")!;
  const { id } = c.req.param();
  const body = await c.req.json();
  const { status, adminNotes } = body;

  if (!["approved", "rejected"].includes(status)) {
    return c.json({ message: "status must be approved or rejected" }, 400);
  }

  const [updated] = await db
    .update(schema.radonicsSpecialtyRequests)
    .set({
      status,
      adminNotes: adminNotes ?? undefined,
      reviewedBy: user.id,
      reviewedAt: new Date(),
    })
    .where(eq(schema.radonicsSpecialtyRequests.id, id))
    .returning();

  if (!updated) return c.json({ message: "Not found" }, 404);

  // If approved, create the official specialty
  if (status === "approved") {
    const req = updated;
    const slug = req.proposedSlug ?? req.proposedName.toLowerCase().replace(/\s+/g, "-");
    await db.insert(schema.radionicsSpecialties).values({
      name: req.proposedName,
      slug,
      description: req.description ?? undefined,
      category: req.category ?? undefined,
      requiresCertification: true,
    }).onConflictDoNothing();
  }

  return c.json({ request: updated }, 200);
});

// ─────────────────────────────────────────────────────────────
// CERTIFICATIONS
// ─────────────────────────────────────────────────────────────

/** GET /api/specialties/certifications — my certifications with documents */
app.get("/certifications", async (c) => {
  const user = c.get("user")!;

  const certs = await db
    .select()
    .from(schema.therapistSpecialtyCertifications)
    .where(eq(schema.therapistSpecialtyCertifications.therapistId, user.id))
    .orderBy(sql`${schema.therapistSpecialtyCertifications.updatedAt} DESC`);

  // Fetch all documents for these certs
  const certIds = certs.map((c) => c.id);
  let docs: typeof schema.therapistSpecialtyDocuments.$inferSelect[] = [];
  if (certIds.length > 0) {
    // SQLite doesn't support IN with Drizzle array easily — use per-cert approach
    for (const certId of certIds) {
      const certDocs = await db
        .select()
        .from(schema.therapistSpecialtyDocuments)
        .where(eq(schema.therapistSpecialtyDocuments.certificationId, certId));
      docs = [...docs, ...certDocs];
    }
  }

  const docsMap = new Map<string, typeof docs>();
  for (const doc of docs) {
    if (!docsMap.has(doc.certificationId)) docsMap.set(doc.certificationId, []);
    docsMap.get(doc.certificationId)!.push(doc);
  }

  const result = certs.map((cert) => ({
    id: cert.id,
    therapistId: cert.therapistId,
    specialtyId: cert.specialtyId,
    status: cert.status,
    yearsOfExperience: cert.yearsOfExperience,
    experienceDescription: cert.experienceDescription ?? undefined,
    trainingInstitution: cert.trainingInstitution ?? undefined,
    trainingCompletedDate: cert.trainingCompletedDate ?? undefined,
    certificateNumber: cert.certificateNumber ?? undefined,
    certifiedBy: cert.certifiedBy ?? undefined,
    adminNotes: cert.adminNotes ?? undefined,
    notes: cert.notes ?? undefined,
    submittedAt: cert.submittedAt ? new Date(cert.submittedAt).toISOString() : undefined,
    reviewedAt: cert.reviewedAt ? new Date(cert.reviewedAt).toISOString() : undefined,
    expiresAt: cert.expiresAt ? new Date(cert.expiresAt).toISOString() : undefined,
    createdAt: new Date(cert.createdAt ?? Date.now()).toISOString(),
    updatedAt: new Date(cert.updatedAt ?? Date.now()).toISOString(),
    documents: (docsMap.get(cert.id) ?? []).map((d) => ({
      id: d.id,
      certificationId: d.certificationId,
      fileUrl: d.fileUrl,
      fileName: d.fileName,
      fileType: d.fileType,
      fileSize: d.fileSize ?? undefined,
      uploadedAt: new Date(d.uploadedAt ?? Date.now()).toISOString(),
    })),
  }));

  return c.json({ certifications: result }, 200);
});

/** GET /api/specialties/certifications/all — admin: all pending certs */
app.get("/certifications/all", async (c) => {
  const certs = await db
    .select()
    .from(schema.therapistSpecialtyCertifications)
    .orderBy(sql`${schema.therapistSpecialtyCertifications.updatedAt} DESC`);

  return c.json({ certifications: certs }, 200);
});

/** POST /api/specialties/certifications — submit certification */
app.post("/certifications", async (c) => {
  const user = c.get("user")!;
  const body = await c.req.json();
  const {
    specialtyId,
    yearsOfExperience,
    experienceDescription,
    trainingInstitution,
    trainingCompletedDate,
    notes,
  } = body;

  if (!specialtyId || yearsOfExperience === undefined) {
    return c.json({ message: "specialtyId and yearsOfExperience required" }, 400);
  }

  // Upsert: therapist may resubmit a rejected cert
  const existing = await db
    .select()
    .from(schema.therapistSpecialtyCertifications)
    .where(
      and(
        eq(schema.therapistSpecialtyCertifications.therapistId, user.id),
        eq(schema.therapistSpecialtyCertifications.specialtyId, specialtyId)
      )
    )
    .limit(1);

  let cert;
  if (existing.length > 0) {
    const prev = existing[0];
    // Only allow resubmission if rejected or not_certified
    if (prev.status === "approved" || prev.status === "pending") {
      return c.json({ message: "Certification already submitted or approved" }, 409);
    }
    [cert] = await db
      .update(schema.therapistSpecialtyCertifications)
      .set({
        status: "pending",
        yearsOfExperience,
        experienceDescription: experienceDescription ?? undefined,
        trainingInstitution: trainingInstitution ?? undefined,
        trainingCompletedDate: trainingCompletedDate ?? undefined,
        notes: notes ?? undefined,
        submittedAt: new Date(),
        adminNotes: undefined,
        reviewedAt: undefined,
        reviewedBy: undefined,
        updatedAt: new Date(),
      })
      .where(eq(schema.therapistSpecialtyCertifications.id, prev.id))
      .returning();
  } else {
    [cert] = await db
      .insert(schema.therapistSpecialtyCertifications)
      .values({
        therapistId: user.id,
        specialtyId,
        status: "pending",
        yearsOfExperience,
        experienceDescription: experienceDescription ?? undefined,
        trainingInstitution: trainingInstitution ?? undefined,
        trainingCompletedDate: trainingCompletedDate ?? undefined,
        notes: notes ?? undefined,
        submittedAt: new Date(),
      })
      .returning();
  }

  return c.json({ certification: cert }, 201);
});

/** PATCH /api/specialties/certifications/:id/review — admin: approve or reject */
app.patch("/certifications/:id/review", async (c) => {
  const user = c.get("user")!;
  const { id } = c.req.param();
  const body = await c.req.json();
  const { status, adminNotes, expiresAt } = body;

  if (!["approved", "rejected"].includes(status)) {
    return c.json({ message: "status must be approved or rejected" }, 400);
  }

  const [updated] = await db
    .update(schema.therapistSpecialtyCertifications)
    .set({
      status,
      adminNotes: adminNotes ?? undefined,
      reviewedBy: user.id,
      reviewedAt: new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(schema.therapistSpecialtyCertifications.id, id))
    .returning();

  if (!updated) return c.json({ message: "Not found" }, 404);
  return c.json({ certification: updated }, 200);
});

// ─────────────────────────────────────────────────────────────
// DOCUMENTS — Presigned upload + delete
// ─────────────────────────────────────────────────────────────

/** POST /api/specialties/certifications/:certId/documents/presign
    Returns a presigned PUT URL for direct client→R2 upload */
app.post("/certifications/:certId/documents/presign", async (c) => {
  const user = c.get("user")!;
  const { certId } = c.req.param();
  const body = await c.req.json();
  const { filename, contentType, fileSize } = body;

  if (!filename || !contentType) {
    return c.json({ message: "filename and contentType required" }, 400);
  }
  if (!ALLOWED_MIME.has(contentType)) {
    return c.json({ message: "File type not allowed. Use PDF, JPG, JPEG or PNG." }, 400);
  }
  if (fileSize && fileSize > 10 * 1024 * 1024) {
    return c.json({ message: "File too large. Max 10MB." }, 400);
  }

  // Verify the cert belongs to this therapist
  const [cert] = await db
    .select()
    .from(schema.therapistSpecialtyCertifications)
    .where(
      and(
        eq(schema.therapistSpecialtyCertifications.id, certId),
        eq(schema.therapistSpecialtyCertifications.therapistId, user.id)
      )
    )
    .limit(1);

  if (!cert) return c.json({ message: "Certification not found" }, 404);
  if (cert.status === "approved") {
    return c.json({ message: "Cannot add documents to an approved certification" }, 409);
  }

  const key = certDocKey(user.id, certId, filename);
  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: CERT_BUCKET,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 600 }
  );

  return c.json({ url, key, fileType: mimeToFileType(contentType) }, 200);
});

/** POST /api/specialties/certifications/:certId/documents
    Register a document after successful upload to R2 */
app.post("/certifications/:certId/documents", async (c) => {
  const user = c.get("user")!;
  const { certId } = c.req.param();
  const body = await c.req.json();
  const { key, fileName, fileType, fileSize } = body;

  if (!key || !fileName || !fileType) {
    return c.json({ message: "key, fileName and fileType required" }, 400);
  }

  // Verify ownership
  const [cert] = await db
    .select()
    .from(schema.therapistSpecialtyCertifications)
    .where(
      and(
        eq(schema.therapistSpecialtyCertifications.id, certId),
        eq(schema.therapistSpecialtyCertifications.therapistId, user.id)
      )
    )
    .limit(1);

  if (!cert) return c.json({ message: "Certification not found" }, 404);

  // Build public-ish URL from R2 (or presigned GET — for MVP just store key as URL)
  // In production this would be a CDN URL. For now use signed GET or key path.
  const fileUrl = `${process.env.S3_ENDPOINT}/${CERT_BUCKET}/${key}`;

  const [doc] = await db
    .insert(schema.therapistSpecialtyDocuments)
    .values({
      certificationId: certId,
      fileUrl,
      fileName,
      fileType,
      fileSize: fileSize ?? undefined,
    })
    .returning();

  return c.json({ document: doc }, 201);
});

/** DELETE /api/specialties/certifications/:certId/documents/:docId */
app.delete("/certifications/:certId/documents/:docId", async (c) => {
  const user = c.get("user")!;
  const { certId, docId } = c.req.param();

  // Verify ownership via cert
  const [cert] = await db
    .select()
    .from(schema.therapistSpecialtyCertifications)
    .where(
      and(
        eq(schema.therapistSpecialtyCertifications.id, certId),
        eq(schema.therapistSpecialtyCertifications.therapistId, user.id)
      )
    )
    .limit(1);

  if (!cert) return c.json({ message: "Certification not found" }, 404);
  if (cert.status === "approved") {
    return c.json({ message: "Cannot delete documents from an approved certification" }, 409);
  }

  const [doc] = await db
    .select()
    .from(schema.therapistSpecialtyDocuments)
    .where(
      and(
        eq(schema.therapistSpecialtyDocuments.id, docId),
        eq(schema.therapistSpecialtyDocuments.certificationId, certId)
      )
    )
    .limit(1);

  if (!doc) return c.json({ message: "Document not found" }, 404);

  // Delete from R2 — extract key from URL
  try {
    const keyPart = doc.fileUrl.replace(`${process.env.S3_ENDPOINT}/${CERT_BUCKET}/`, "");
    await s3.send(new DeleteObjectCommand({ Bucket: CERT_BUCKET, Key: keyPart }));
  } catch {
    // S3 delete failure is non-fatal — remove DB record anyway
  }

  await db
    .delete(schema.therapistSpecialtyDocuments)
    .where(eq(schema.therapistSpecialtyDocuments.id, docId));

  return c.json({ deleted: true }, 200);
});

export { app as specialtiesRouter };
