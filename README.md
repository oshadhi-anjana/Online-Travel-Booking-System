# Deployment

For a single Netlify deployment of both the frontend and API, follow [DEPLOY_NETLIFY.md](DEPLOY_NETLIFY.md). Render is not required. Payment slip limit: 4 MB.

# Serandib Tours

A React + Express + MongoDB travel application. Browse and filter six example Sri Lankan trips, create an account, reserve and cancel trips, update your profile and password, and publish or delete your own reviews.

## Run locally

Requires Node.js, npm, and a reachable MongoDB database.

1. In `backend`, run `npm install`. Copy `.env.example` to `.env` only if you do not already have your own `.env`. Set your MongoDB URI and a long random `SECRET_KEY`.
2. Run `npm start` in `backend`. It connects to MongoDB before listening at http://localhost:8070.
3. In a second terminal, run `npm install` and `npm start` in `frontend`. Open http://localhost:3000.

The existing backend/.env is preserved. For Atlas, add your current IP and use your database user's credentials. URL-encode special characters in the password. Do not commit .env files.

Optional frontend configuration: copy `frontend/.env.example` to `frontend/.env` to change the API address. Restart the frontend after changing it. Set backend `FRONTEND_URL` to your frontend origin if different from http://localhost:3000.

## Checks

- Frontend production bundle: `cd frontend`, then `npm run build`.
- Frontend behavior tests: `npm test -- --watchAll=false`.
- Backend security and validation tests: `cd backend`, then `node --test tests/api.test.js`.
- Database health: GET http://localhost:8070/health.

## Behavior and boundaries

All prices are example prices in LKR. The server calculates totals from the catalog, and accepts 1–12 travellers and a departure date from today onward in Sri Lanka. Bookings are saved reservations, not paid tickets. There is no payment gateway, live inventory, transport integration, or email delivery. Admins can manually confirm reservations and bank payments. Arrange those services separately before real commercial use. Destination photography uses external images with a local fallback; destination imagery is illustrative.

Sessions expire after one day. Protected operations require a signed bearer token and enforce ownership. Password changes require the old password; deleting an account requires its password and removes associated bookings and reviews. Existing passwords remain compatible. Old localStorage sessions are replaced by the new sign-in flow.

The API tests use isolated model stubs and do not write to your Atlas database. A complete live database smoke test still requires your working MongoDB connection. Before public production deployment, add TLS, request rate limiting, payment/inventory integrations as needed, backup procedures, and deployment-specific secret management.

## Bank payment via WhatsApp

After a reservation is saved successfully, the browser redirects to WhatsApp number 07xxxxxxxx (international format +947xxxxxxxx). A prepared message includes the booking reference, destination, date, traveller count, and server-calculated LKR total. The traveller sends the message to request bank details and arrange a transfer. Active reservations also have a Get bank payment details link in My bookings. Opening the chat does not send a message or mark a reservation paid. Bank transfer verification is handled manually by the tour operator.

## Admin dashboard

Set ADMIN_EMAIL and ADMIN_PASSWORD only in ignored backend/.env. On backend startup the configured account is created (or promoted if it exists). Passwords are hashed. Startup does not overwrite an existing account password. To explicitly set/reset it to the configured password, run `npm run seed:admin` in backend. Sign in using the normal login page; admins land at /admin.

The dashboard lists users, all bookings and reviews, supports searching, booking status updates, manual bank-payment verification (Pending/Paid), and review removal. The API checks the stored admin role on every request; registration/profile forms cannot set roles. Customers see updated booking and payment statuses. Cancellation does not refund bank transfers.

## Destinations and bank transfer slips

Admins publish additional destinations from Admin → Destinations. These are stored in MongoDB alongside the built-in catalog, and booking totals use the stored destination price. Photo URLs must use HTTPS. Destination IDs are unique, lowercase, hyphen-separated words.

Admins do not see customer My bookings links; opening /bookings as an admin redirects to the admin workspace. Destination details show management navigation instead of the customer reservation form.

Customers attach bank transfer evidence from My bookings → Attach payment slip. PNG, JPEG, and PDF files up to 4 MB are accepted and their file signatures are checked. Slips are stored as private binary data in the booking's MongoDB document, excluded from normal booking responses, and downloaded only through an authenticated owner/admin endpoint. An upload sets payment status to Under review, not Paid. Each active unpaid booking accepts one payment slip. After upload, the slip is locked: customers cannot edit or replace it. The backend atomically rejects repeat uploads. Admins download slips from the reservation card and verify the bank transfer before marking Paid. The application does not automatically verify bank transactions or issue refunds.

## Editing destinations

In Admin → Destinations, choose Edit destination. Fields are prefilled and the URL ID is fixed so existing links and reservation references remain valid. Editing is disabled while any booking for the destination is Reserved or Confirmed, regardless of payment status. Cancelled and Completed bookings do not block changes. The server checks this rule again on save and returns a clear conflict message if a new reservation has appeared. Existing booking names, durations, and totals remain unchanged. Built-in destinations can also be edited; MongoDB overrides replace their catalog entries without duplicates.
