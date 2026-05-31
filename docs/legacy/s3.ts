import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

export const CERT_BUCKET = process.env.S3_BUCKET!;

/** Allowed MIME types for certification documents */
export const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

/** Map MIME to file extension label */
export function mimeToFileType(mime: string): "pdf" | "jpg" | "jpeg" | "png" {
  if (mime === "application/pdf") return "pdf";
  if (mime === "image/jpeg" || mime === "image/jpg") return "jpg";
  return "png";
}

/** Build R2 object key for a certification document */
export function certDocKey(therapistId: string, certId: string, filename: string): string {
  const uuid = crypto.randomUUID();
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `radionics/certifications/${therapistId}/${certId}/${uuid}-${safe}`;
}
