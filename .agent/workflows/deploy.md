---
description: How to deploy the SDR Job Agent (Next.js + FastAPI)
---

# Deployment Workflow

This workflow guides you through deploying the SDR Job Agent to production.

## 1. Backend Deployment (FastAPI)

We recommend **Render** or **Railway** for the backend since they handle Docker well.

### Pre-requisites
- Ensure `backend/requirements.txt` is updated.
- Ensure `backend/Dockerfile` exists.

### Steps
1. Push your code to GitHub.
2. Create a new "Web Service" on [Render](https://render.com).
3. Connect your repository.
4. Set the **Root Directory** to `backend`.
5. Environment Variables:
   - `CEREBRAS_API_KEY`: Your Cerebras key.
   - `TAVILY_API_KEY`: Your Tavily key.
   - `SUPABASE_URL`: Your Supabase Project URL.
   - `SUPABASE_KEY`: Your Supabase Service Role/Anon Key.
   - `FRONTEND_URL`: The URL of your deployed frontend (e.g., `https://your-app.vercel.app`).

---

## 2. Frontend Deployment (Next.js)

We recommend **Vercel** for the frontend.

### Steps
1. Create a new project on [Vercel](https://vercel.com).
2. Connect your repository.
3. Set the **Root Directory** to `frontend`.
4. Environment Variables:
   - `NEXT_PUBLIC_API_URL`: The URL of your deployed backend (e.g., `https://your-backend.onrender.com`).
5. Deploy.

---

## 3. Post-Deployment
// turbo
1. Update the `FRONTEND_URL` in your backend environment variables with the actual Vercel URL.
2. Verify that searching for jobs and uploading CVs works on the live site.
