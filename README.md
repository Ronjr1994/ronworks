# RonWorks Private Portfolio

This version is prepared for a **private GitHub repository** and a
**password-protected Render web service**.

## Privacy model

- GitHub protects the source repository when its visibility is set to **Private**.
- The Express server serves only files inside `public/`.
- Every portfolio route and asset requires HTTP Basic Authentication.
- `/health` remains public so Render can run its health check. It exposes only
  `{"status":"ok"}`.
- Search-engine indexing is discouraged with `X-Robots-Tag`.
- Credentials are environment variables and are not stored in this repository.

> Basic Authentication is appropriate for a small private portfolio shared with
> trusted people. It is not a replacement for user accounts, audit logs,
> multi-factor authentication, or fine-grained permissions.

## Local run

Install dependencies:

```bash
npm install
```

Set credentials and start the server.

### macOS or Linux

```bash
AUTH_USERNAME="your-user" AUTH_PASSWORD="your-long-unique-password" npm start
```

### Windows PowerShell

```powershell
$env:AUTH_USERNAME="your-user"
$env:AUTH_PASSWORD="your-long-unique-password"
npm start
```

Open `http://localhost:3000`. Your browser will ask for the username and
password.

## Deploy with Render Blueprint

1. Push this complete project to a **private GitHub repository**.
2. In Render, connect GitHub and grant the Render GitHub App access to that
   repository.
3. Create a new Blueprint and select the repository.
4. Render reads `render.yaml`.
5. During the initial Blueprint creation, provide:
   - `AUTH_USERNAME`
   - `AUTH_PASSWORD`
6. Use a unique password with at least 12 characters.
7. Deploy and open the generated Render URL.

The credentials use `sync: false`, so their values are entered in Render and are
not committed to GitHub.

### Existing Render service or Blueprint

If the Render service already exists, add or update these values manually under:

**Render Dashboard → Service → Environment**

Then redeploy:

- `AUTH_USERNAME`
- `AUTH_PASSWORD`

Render does not prompt for newly added `sync: false` variables when updating an
existing Blueprint.

## Change the password

Update `AUTH_PASSWORD` under the service's Render Environment settings and
redeploy the service. Do not edit the source files to store a password.

## Important limitations

Anyone who receives the portfolio username and password can view and download
the assets that the website sends to their browser. Password protection prevents
unauthorized public access, but it cannot prevent an authorized viewer from
saving displayed files.

Do not put API keys, database credentials, private tokens, or unrelated
confidential documents inside `public/`.

## npm registry for Render

This archive includes a project-level `.npmrc` and a public-registry build command.
They prevent Render from trying to download packages from a private/internal registry.

Recommended Render settings:

```text
Build Command: npm ci --omit=dev --registry=https://registry.npmjs.org/
Start Command: npm start
Health Check Path: /health
```

