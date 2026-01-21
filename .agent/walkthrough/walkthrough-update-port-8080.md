# Walkthrough - Update Port to 8080

## 1. Package.json Updates
Updated `dev` and `start` scripts to include `-p 8080`.

## 2. Docker Compose Updates
Updated `web-dev` service to map `8080:8080` and use `--port 8080`.

## 3. Documentation
Updated `README.md` to point to `http://localhost:8080`.

## 4. Verification

Ran `npm run dev` and confirmed output:

```
> pdfcraft@0.1.0 dev
> next dev --turbopack -p 8080

...
   ▲ Next.js 15.5.9 (Turbopack)
   - Local:        http://localhost:8080
...
```

The application now runs on port 8080 by default.
