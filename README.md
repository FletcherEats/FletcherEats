
Fletcher Eats Monorepo (Option C) - GitHub-ready

Folders:
- frontend/  -> Static site for Netlify (contains pages, styles, app.backend.js)
- backend/   -> Express backend for Render (routes, models, server.js)

Configs included:
- netlify.toml -> Netlify will publish frontend folder
- render.yaml  -> Render friendly service config

How to use:
1. Create a new GitHub repo and push the contents of this monorepo.
2. On Netlify, create a new site from GitHub and select this repo. Netlify will use netlify.toml to publish the frontend.
3. On Render, create a new Web Service from this repo and point to the backend folder (or use render.yaml).
4. Set environment variables (see backend/.env.example) on Render and Netlify (for Stripe publishable key).

After deploy:
- Update frontend app.backend.js or set BACKEND_URL env var in Netlify to point to your Render backend URL.
- Configure Stripe webhooks to hit Render backend /webhook/stripe and set STRIPE_WEBHOOK_SECRET.
