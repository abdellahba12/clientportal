# ClientPortal 🚀

A SaaS client portal for freelancers and designers. Built with React + Node.js + PostgreSQL.

## Features
- ✅ Auth (register/login with JWT)
- ✅ Client management (freemium: 2 clients free, unlimited on Pro)
- ✅ Project tracking with task progress bars
- ✅ File uploads (up to 10MB per file)
- ✅ Invoice management with revenue tracking
- ✅ Internal messaging per project

---

## Deploy on Railway (Step by Step)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USER/clientportal.git
git push -u origin main
```

### 2. Create Railway Project
1. Go to [railway.app](https://railway.app) → New Project
2. Select "Deploy from GitHub repo"
3. Connect your repo

### 3. Add PostgreSQL Database
1. In Railway dashboard → New Service → Database → PostgreSQL
2. Copy the `DATABASE_URL` from the database service

### 4. Deploy Backend
1. New Service → GitHub Repo → select root directory: `backend`
2. Add environment variables:
   ```
   DATABASE_URL=postgresql://...  (from step 3)
   JWT_SECRET=any_random_long_string_here
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.up.railway.app
   PORT=4000
   ```

### 5. Deploy Frontend
1. New Service → GitHub Repo → select root directory: `frontend`
2. Add environment variables:
   ```
   REACT_APP_API_URL=https://your-backend.up.railway.app/api
   ```

### 6. Done! 🎉
Railway will auto-deploy on every `git push`.

---

## Local Development

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your local PostgreSQL connection
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env: REACT_APP_API_URL=http://localhost:4000/api
npm start
```

---

## Monetization (Freemium Model)
- **Free plan**: Up to 2 clients
- **Pro plan ($29/month)**: Unlimited clients + priority support

To upgrade a user manually (until Stripe is integrated):
```sql
UPDATE users SET plan = 'pro' WHERE email = 'user@example.com';
```
