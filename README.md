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

All prices are example prices in LKR. The server calculates totals from the catalog, and accepts 1–12 travellers and a departure date from today onward in Sri Lanka. Bookings are saved reservations, not paid tickets. There is no payment gateway, live inventory, transport integration, email delivery, or operator confirmation. Arrange those services separately before real commercial use. Destination photography uses external images with a local fallback; destination imagery is illustrative.

Sessions expire after one day. Protected operations require a signed bearer token and enforce ownership. Password changes require the old password; deleting an account requires its password and removes associated bookings and reviews. Existing passwords remain compatible. Old localStorage sessions are replaced by the new sign-in flow.

The API tests use isolated model stubs and do not write to your Atlas database. A complete live database smoke test still requires your working MongoDB connection. Before public production deployment, add TLS, request rate limiting, an operator workflow, payment/inventory integrations as needed, backup procedures, and deployment-specific secret management.

## Bank payment via WhatsApp

After a reservation is saved successfully, the browser redirects to WhatsApp number 0762042696 (international format +94762042696). A prepared message includes the booking reference, destination, date, traveller count, and server-calculated LKR total. The traveller sends the message to request bank details and arrange a transfer. Active reservations also have a Get bank payment details link in My bookings. Opening the chat does not send a message or mark a reservation paid. Bank transfer verification is handled manually by the tour operator.
