# Deployment Guide: SDR Job Agent 🚀

Follow these steps to take your application from local development to the live web.

## 1. Backend Deployment (Render)

Render is great for FastAPI. You'll need to link your GitHub repository.

### Setup on Render:
1.  **Create New Web Service**: Select your repo.
2.  **Environment**: Select `Python`.
3.  **Build Command**: `pip install -r requirements.txt`
4.  **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5.  **Environment Variables**: Add the following from your `.env` file:
    - `SUPABASE_URL`
    - `SUPABASE_KEY`
    - `TAVILY_API_KEY`
    - `CEREBRAS_API_KEY`
    - `FRONTEND_URL`: (Set this after deploying the frontend, e.g., `https://your-app.vercel.app`)

---

## 2. Frontend Deployment (Vercel)

Vercel is the best for Next.js. 

### Setup on Vercel:
1.  **Import Project**: Select the `frontend` folder from your repo.
2.  **Framework Preset**: `Next.js`.
3.  **Environment Variables**: Add:
    - `NEXT_PUBLIC_API_URL`: (Point this to your backend URL, e.g., `https://your-backend.onrender.com`)

---

## 3. Post-Deployment Checklist

- [ ] **Database Connection**: Ensure the backend can talk to Supabase.
- [ ] **CORS**: Ensure the backend's `FRONTEND_URL` exactly matches your Vercel URL.
- [ ] **API Keys**: Make sure all keys are entered without quotes or extra spaces.

---

> [!TIP]
> **Pro Tip**: Use the same GitHub repo for both. In Render, you can set the "Root Directory" to `backend`. In Vercel, you can set the "Root Directory" to `frontend`.
