import "dotenv/config";
import os from "node:os";
import path from "node:path";

const weakJwtSecrets = new Set(["", "dev-secret", "change-me-in-production"]);
const allowWeakJwtSecret = process.env.ALLOW_WEAK_JWT_SECRET === "true";

// Default falls outside any web server's document root (e.g. XAMPP's htdocs/) so
// uploaded files can never be fetched/executed directly by a co-located web server,
// even if UPLOAD_DIR isn't explicitly configured. Set UPLOAD_DIR explicitly in
// production to a path outside any web-servable directory.
const defaultUploadDir = path.join(os.tmpdir(), "partner-api-uploads");

export const config = {
  port: Number(process.env.PORT || 4100),
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  uploadDir: process.env.UPLOAD_DIR || defaultUploadDir,
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
};

const isWeakJwtSecret = weakJwtSecrets.has(config.jwtSecret) || config.jwtSecret.length < 32;

// This check runs in every environment, not just production: a weak/default JWT
// secret lets anyone forge valid tokens, and relying on NODE_ENV being set correctly
// in every deployment is not a safe assumption.
if (isWeakJwtSecret && !allowWeakJwtSecret) {
  throw new Error(
    "JWT_SECRET must be at least 32 random characters. It is missing, too short, or still " +
      'set to a known default value like "dev-secret". Set ALLOW_WEAK_JWT_SECRET=true only ' +
      "for local development.",
  );
}

if (process.env.NODE_ENV === "production") {
  if (allowWeakJwtSecret) {
    throw new Error("ALLOW_WEAK_JWT_SECRET must not be set to true in production.");
  }

  if (!config.databaseUrl) {
    throw new Error("DATABASE_URL is required in production.");
  }
}