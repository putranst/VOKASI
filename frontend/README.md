# Frontend

Next.js + TypeScript frontend scaffold for VOKASI.

## Manual Run

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Docker Run

From repo root:

```bash
docker compose up --build frontend
```

## Environment

Set API base URL if your backend is not on default host/port:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

You can copy `frontend/.env.example` to `.env.local`.
