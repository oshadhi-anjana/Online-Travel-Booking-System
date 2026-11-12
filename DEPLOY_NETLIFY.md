# Deploy frontend and API together on Netlify

Render is no longer required. MongoDB Atlas remains the database. Netlify runs the Express API as a Function and serves the React frontend on the same domain.

## 1. Push the latest changes

Commit the source files, package-lock.json changes, and root netlify.toml to GitHub. Never add backend/.env or frontend/.env. Use Git integration, not a drag-and-drop upload of the React build: a static build alone does not deploy the API.

## 2. Import the repository into Netlify

Choose Add new project → Import an existing project → GitHub → your repository. Select the Free plan. Use the settings from netlify.toml. Remove any old build overrides that point to frontend alone.

- Base directory: backend
- Build command: npm ci && npm --prefix ../frontend ci && npm --prefix ../frontend run build
- Publish directory: ../frontend/build (relative to base directory)
- Functions directory: netlify/functions (relative to base directory)
- Node: 22 (set in netlify.toml)

## 3. Add private environment variables

Under the project's environment variables, add these values with Functions/runtime scope (all scopes if the UI has no separate selector):

- MONGODB_URL: your Atlas connection string
- SECRET_KEY: a long random secret
- ADMIN_EMAIL: your chosen admin email
- ADMIN_PASSWORD: your admin password

Do not prefix secrets with REACT_APP_: those variables are embedded in public JavaScript. Do not store real credentials in netlify.toml or Git. FRONTEND_URL is not needed for this same-domain deployment. REACT_APP_API_URL is set to /api by netlify.toml. Delete any old Netlify UI value pointing it at localhost or Render; alternatively set the UI value to /api. Redeploy after changing environment variables.

## 4. Allow database connections from Netlify

In MongoDB Atlas Network Access, permit the deployment's outbound connections. Standard Netlify Functions do not have a fixed outbound IP. For a small demo, Atlas's Allow Access From Anywhere option (0.0.0.0/0) permits these connections, but exposes database network access publicly: keep authentication enabled and use a dedicated database user with access only to the app's database and a strong password. Do not disable TLS. A restricted fixed-egress setup requires additional networking infrastructure and may not fit the free plan.

## 5. Deploy and verify

After a successful deployment, open https://YOUR-SITE.netlify.app/api/health. It should return {"status":"ready"}. Then test normal/admin sign-in, destination creation/editing, reservations, and a small payment-slip upload/download. Cold starts may take longer while the function connects to Atlas. Database connections are reused by warm function instances.

The public API prefix is /api. React routes (/admin, /bookings, etc.) still load normally on refresh. Payment slips are private in MongoDB and accept PNG/JPEG/PDF up to 4 MB to stay below Netlify's buffered binary request/response limits. The same owner/admin permissions and one-upload-only rule apply.

## Local development

Existing commands are unchanged: run npm start or npm run dev in backend, then npm start in frontend. Local development calls http://localhost:8070; production builds default to /api. An optional REACT_APP_API_URL override must point at your intended server.

## Free-plan limits

Choose Netlify Free, not a paid plan. Free plans have a monthly hard credit limit and no auto recharge; sites may pause when the limit is reached. Production builds, requests, bandwidth, and functions consume credits. Check the current usage in Netlify's billing dashboard. MongoDB Atlas has its own separate free-tier limits. No billing setup or deployment has been performed by this code change.
