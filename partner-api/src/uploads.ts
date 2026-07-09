import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import { fileTypeFromBuffer } from "file-type";
import { config } from "./config.js";
import { HttpError } from "./http.js";

const allowedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
const extensionByMimeType: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

fs.mkdirSync(config.uploadDir, { recursive: true });

// Files are held in memory (not written to disk) until verifyAndPersistUpload()
// confirms their real content matches an allowed type. This endpoint is reachable
// without authentication (partner registration), so nothing attacker-controlled
// touches disk before that check passes.
export const partnerDocumentUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 2,
  },
  fileFilter: (_request, file, callback) => {
    // Cheap first-pass rejection based on the client-declared Content-Type. This is
    // NOT trusted for security - it's spoofable. verifyAndPersistUpload() below is
    // the real check, based on the file's actual magic bytes.
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new HttpError(400, "Only PDF, JPG, PNG, or WEBP files are allowed."));
      return;
    }
    callback(null, true);
  },
});

/**
 * Verifies a multer memoryStorage file's real content via magic-byte sniffing,
 * then writes it to disk under a random name with an extension derived from the
 * verified type (never from the attacker-supplied original filename).
 */
export async function verifyAndPersistUpload(file: Express.Multer.File): Promise<string> {
  const detected = await fileTypeFromBuffer(file.buffer);
  const detectedMime = detected?.mime;

  if (!detectedMime || !allowedMimeTypes.has(detectedMime)) {
    throw new HttpError(400, "Only PDF, JPG, PNG, or WEBP files are allowed.");
  }

  const filename = `${Date.now()}-${crypto.randomUUID()}${extensionByMimeType[detectedMime]}`;
  const destination = path.join(config.uploadDir, filename);
  await fs.promises.writeFile(destination, file.buffer);
  return destination;
}
