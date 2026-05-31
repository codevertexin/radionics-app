import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ─── Better Auth schema ───────────────────────────────────────
export * from "./auth-schema";

// ─── Helper: current timestamp ───────────────────────────────
const nowMs = () => sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

// ─── radionics_specialties ────────────────────────────────────
// Catalog of official specialties managed by admins.
// Therapists cannot insert here — they submit specialty_requests.
export const radionicsSpecialties = sqliteTable(
  "radionics_specialties",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    category: text("category"),
    imageUrl: text("image_url"),
    requiresCertification: integer("requires_certification", { mode: "boolean" })
      .notNull()
      .default(true),
    isActive: integer("is_active", { mode: "boolean" })
      .notNull()
      .default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(nowMs()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(nowMs())
      .$onUpdate(() => new Date()),
  },
  (t) => [index("idx_specialties_slug").on(t.slug)]
);

// ─── radionics_specialty_requests ────────────────────────────
// Therapist-proposed specialties not yet in the catalog.
// Admin reviews and optionally promotes to radionics_specialties.
export const radonicsSpecialtyRequests = sqliteTable(
  "radionics_specialty_requests",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    therapistId: text("therapist_id").notNull(),
    proposedName: text("proposed_name").notNull(),
    proposedSlug: text("proposed_slug"),
    description: text("description"),
    category: text("category"),
    notes: text("notes"),
    // status: 'pending_review' | 'approved' | 'rejected'
    status: text("status").notNull().default("pending_review"),
    adminNotes: text("admin_notes"),
    reviewedBy: text("reviewed_by"),
    reviewedAt: integer("reviewed_at", { mode: "timestamp_ms" }),
    submittedAt: integer("submitted_at", { mode: "timestamp_ms" })
      .notNull()
      .default(nowMs()),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(nowMs()),
  },
  (t) => [
    index("idx_sreq_therapist").on(t.therapistId),
    index("idx_sreq_status").on(t.status),
  ]
);

// ─── therapist_specialty_certifications ──────────────────────
// One row per (therapist, specialty). Tracks certification status.
export const therapistSpecialtyCertifications = sqliteTable(
  "therapist_specialty_certifications",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    therapistId: text("therapist_id").notNull(),
    specialtyId: text("specialty_id")
      .notNull()
      .references(() => radionicsSpecialties.id),
    // status: 'approved' | 'pending' | 'rejected' | 'expired' | 'not_certified'
    status: text("status").notNull().default("not_certified"),
    yearsOfExperience: integer("years_of_experience").notNull(),
    experienceDescription: text("experience_description"),
    trainingInstitution: text("training_institution"),
    trainingCompletedDate: text("training_completed_date"), // ISO date string
    certificateNumber: text("certificate_number"),
    certifiedBy: text("certified_by"),
    adminNotes: text("admin_notes"),
    notes: text("notes"),
    submittedAt: integer("submitted_at", { mode: "timestamp_ms" }),
    reviewedAt: integer("reviewed_at", { mode: "timestamp_ms" }),
    reviewedBy: text("reviewed_by"),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(nowMs()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(nowMs())
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("idx_cert_therapist_specialty").on(t.therapistId, t.specialtyId),
    index("idx_cert_therapist").on(t.therapistId),
    index("idx_cert_specialty").on(t.specialtyId),
    index("idx_cert_status").on(t.status),
  ]
);

// ─── therapist_specialty_documents ───────────────────────────
// Files attached to a certification (PDFs, images).
export const therapistSpecialtyDocuments = sqliteTable(
  "therapist_specialty_documents",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    certificationId: text("certification_id")
      .notNull()
      .references(() => therapistSpecialtyCertifications.id),
    fileUrl: text("file_url").notNull(),
    fileName: text("file_name").notNull(),
    // file_type: 'pdf' | 'jpg' | 'jpeg' | 'png'
    fileType: text("file_type").notNull(),
    fileSize: integer("file_size"), // bytes
    uploadedAt: integer("uploaded_at", { mode: "timestamp_ms" })
      .notNull()
      .default(nowMs()),
  },
  (t) => [index("idx_docs_cert").on(t.certificationId)]
);
