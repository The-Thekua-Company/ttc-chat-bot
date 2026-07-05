# Deploying to Vercel

This backend runs as serverless functions under `api/` when deployed to Vercel. Follow these steps to get it live.

## First-time deployment

1. Push the project to GitHub (if not already done).
2. Go to [vercel.com](https://vercel.com) and sign up free using your GitHub account.
3. Click **Add New Project** → import your GitHub repo.
4. In the **Environment Variables** section, add every variable listed in `.env.example`, using your real values:
   - `ANTHROPIC_API_KEY`
   - `CLAUDE_MODEL`
   - `HOSTINGER_EMAIL`
   - `HOSTINGER_EMAIL_PASSWORD`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_FROM`
   - `TWILIO_WHATSAPP_TO`

   (`PORT` is not needed on Vercel — that's only used by the local Express server in `src/server.js`.)
5. Click **Deploy** — Vercel builds and deploys automatically.
6. Once deployed, copy the live URL Vercel gives you (e.g. `https://ttc-chat-bot.vercel.app`).
7. Paste that URL into `widget/script.js` as the `BACKEND_URL` constant, replacing the placeholder.
8. Paste the same URL into the WordPress plugin PHP file, wherever it references the backend.
9. Commit and push that change to GitHub (or redeploy manually) so the widget starts pointing at the live backend.

## Redeploying after a code change

No manual redeploy step needed — once your GitHub repo is connected to a Vercel project, **every push to the connected branch automatically triggers a new deployment**. Just commit and push as usual, and Vercel handles the rest within a minute or two.
