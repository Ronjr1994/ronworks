const crypto = require("crypto");
const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");

const authUsername = process.env.AUTH_USERNAME?.trim();
const authPassword = process.env.AUTH_PASSWORD;

if (!authUsername || !authPassword) {
  console.error(
    "Startup blocked: set AUTH_USERNAME and AUTH_PASSWORD in the environment."
  );
  process.exit(1);
}

if (authPassword.length < 12) {
  console.warn(
    "Security warning: AUTH_PASSWORD should contain at least 12 characters."
  );
}

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
  );
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");

  if (req.secure || req.get("x-forwarded-proto") === "https") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  next();
});

// Render must be able to verify the service without portfolio credentials.
// This endpoint exposes no portfolio content.
app.get("/health", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ status: "ok" });
});

function hashCredential(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest();
}

function credentialsMatch(actual, expected) {
  return crypto.timingSafeEqual(
    hashCredential(actual),
    hashCredential(expected)
  );
}

function requestCredentials(res) {
  res.setHeader(
    "WWW-Authenticate",
    'Basic realm="RonWorks Private Portfolio", charset="UTF-8"'
  );
  res.setHeader("Cache-Control", "no-store");
  return res.status(401).send("Authentication required.");
}

app.use((req, res, next) => {
  const authorization = req.get("authorization");

  if (!authorization || !authorization.startsWith("Basic ")) {
    return requestCredentials(res);
  }

  const encodedCredentials = authorization.slice("Basic ".length).trim();
  const decodedCredentials = Buffer.from(
    encodedCredentials,
    "base64"
  ).toString("utf8");
  const separatorIndex = decodedCredentials.indexOf(":");

  if (separatorIndex < 0) {
    return requestCredentials(res);
  }

  const suppliedUsername = decodedCredentials.slice(0, separatorIndex);
  const suppliedPassword = decodedCredentials.slice(separatorIndex + 1);

  const validUsername = credentialsMatch(suppliedUsername, authUsername);
  const validPassword = credentialsMatch(suppliedPassword, authPassword);

  if (!validUsername || !validPassword) {
    return requestCredentials(res);
  }

  next();
});

app.use(
  express.static(publicDir, {
    dotfiles: "deny",
    index: "index.html",
    maxAge: "1h",
    setHeaders(res) {
      // Protected files may be cached by the signed-in browser, but not by
      // shared/public caches.
      res.setHeader("Cache-Control", "private, max-age=3600");
    },
  })
);

app.use((req, res) => {
  res.status(404).send("Not found");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Private portfolio server running on port ${port}`);
});
