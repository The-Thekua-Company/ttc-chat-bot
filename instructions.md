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
8. Copy the updated `widget/script.js` into `wordpress-plugin/ttc-chatbot-widget/assets/script.js` too (the plugin ships its own copy of the widget files, since the live WordPress server can't reach this project's `widget/` folder directly).
9. Commit and push that change to GitHub (or redeploy manually) so the widget starts pointing at the live backend.

## Redeploying after a code change

No manual redeploy step needed — once your GitHub repo is connected to a Vercel project, **every push to the connected branch automatically triggers a new deployment**. Just commit and push as usual, and Vercel handles the rest within a minute or two.

## WordPress Plugin Installation

The chat widget is packaged as a small, self-contained WordPress plugin at `wordpress-plugin/ttc-chatbot-widget/`. It has no settings page — the backend URL is already baked into its copy of `script.js`, so it works right out of the box once installed.

1. Locate the `wordpress-plugin/ttc-chatbot-widget/` folder in this project.
2. Zip that folder itself (not just its contents) — you should end up with a `ttc-chatbot-widget.zip` whose top level is the `ttc-chatbot-widget` folder.
3. Log in to your WordPress admin dashboard for thekuacompany.com.
4. Go to **Plugins → Add New Plugin → Upload Plugin**.
5. Choose the `ttc-chatbot-widget.zip` file and click **Install Now**.
6. Once installed, click **Activate Plugin**.
7. Visit your live site (any page) — the 💬 chat bubble should appear in the bottom-right corner automatically, since the plugin loads it site-wide via the WordPress footer.

**If you ever update the widget** (`widget/style.css` or `widget/script.js` in this project), remember to also copy the updated file into `wordpress-plugin/ttc-chatbot-widget/assets/` and re-zip/re-upload the plugin — the plugin ships its own copies rather than referencing this project's files, since WordPress can't see this project's folder structure.
