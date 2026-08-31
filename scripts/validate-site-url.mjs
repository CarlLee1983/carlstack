const value = process.env.SITE_URL;
let url;

if (!value) {
  throw new Error("SITE_URL must be set to the production HTTPS URL");
}

try {
  url = new URL(value);
} catch {
  throw new Error("SITE_URL must be set to the production HTTPS URL");
}

if (
  url.protocol !== "https:" ||
  /(^|\.)example(\.(com|net|org))?$/.test(url.hostname)
) {
  throw new Error("SITE_URL must be a production HTTPS URL");
}
