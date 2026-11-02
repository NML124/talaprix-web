# Backend integration status (public web app)

What the web app (`apps/web`) already calls, and what is not yet properly connected to Supabase. The backend lives in `talaprix-supabase-api`; this file only describes the expectations of the front end.

## Connected

| Feature                         | Endpoint / table                              | Notes                                                                                                                  |
| ------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Catalogue, results              | `GET get-offer-references`                    | Sort, price, category and shop filters depend on the deployed RPC (see the mobile `PLAN_VERIFICATION_FILTRES_TRI.md`). |
| Product page (offers)           | `GET get-offer-reference-offers`              | `sort=best_price` or `nearest` with `lat` and `lon`.                                                                   |
| Product page (history, phone)   | `GET get-detail-product`                      | Best-effort enrichment.                                                                                                |
| Search suggestions              | `POST search-offer-references`                |                                                                                                                        |
| "Signaler ce produit" (search)  | `POST product-demand`                         | Requires login.                                                                                                        |
| Price alert                     | `POST post_alert`                             | Requires login.                                                                                                        |
| Favourites                      | table `favorites` (insert/delete, RLS)        | Same approach as the mobile app.                                                                                       |
| Cart "Enregistrer ma sélection" | `POST post-selection`                         | The cart itself is stored on the device, per account.                                                                  |
| Categories, shops, ads          | `get-categories`, `get-shops-list`, `get-pub` |                                                                                                                        |
| Login                           | Supabase Auth (e-mail OTP, Google OAuth)      | See "Configuration" below.                                                                                             |

## Not connected yet (front end ready)

### 1. Contact / problem report (`/contact`)

- The front end calls `POST post-support-message`, which does not exist yet. The full contract is in [`support-message-endpoint.md`](./support-message-endpoint.md).
- Until it is deployed, the page offers to send the prepared message by e-mail (`mailto:`) or WhatsApp.
- The "Autre" topic sends `topic: "Autre : <texte saisi>"`.

### 2. Merchant sign-up ("Inscrire ma boutique", `/commercants`)

- **Today:** nothing is sent to the backend. After the 3 steps, the page shows a success animation ("Demande reçue… en attente de validation"). The visitor then sends the summary to the team through WhatsApp (`https://wa.me/243980000147`).
- **Expected:** a function such as `POST post-shop-request`, or reuse of `request-become-shop` if it fits, with this body:

  ```json
  {
    "shop_name": "…",
    "phone": "+243…",
    "categories": ["Téléphones", "Autre (pièces moto)"],
    "commune": "Gombe",
    "district": "…",
    "address": "…",
    "street": "…",
    "number": "…",
    "lat": -4.3429,
    "lon": 15.2577,
    "consent": true
  }
  ```

  - Store the request with the status `pending`, visible in the admin app.
  - **Send an e-mail or WhatsApp message to the merchant** confirming that their request is received and pending validation. Once it is approved or rejected, send another message. The success screen already tells them: "Votre boutique est en attente de validation. Notre équipe vérifie vos informations et vous contacte sur WhatsApp."
  - Ask for an e-mail address in step 2 if the confirmation must be sent by e-mail (not collected today).

- Communes come from a local list of the 24 communes of Kinshasa (`libs/shops/data-access/src/lib/kinshasa-communes.ts`). If the backend keeps a communes table, expose it so the list has a single source.
- The GPS position (optional) comes from the browser. Mapbox reverse geocoding fills in the address if `MAPBOX_API_KEY` is set.

### 3. Shop logo / photo in the merchant form

- The file is only selected in the browser; it is not uploaded. To connect it, upload it to storage (bucket `shop`) with the future sign-up function.

## Configuration to check on the server

- **Google sign-in:** add the site URLs (`http://localhost:4200`, `https://talaprix.com`) to `ADDITIONAL_REDIRECT_URLS` (GoTrue `URI_ALLOW_LIST`). Otherwise Google returns to `SITE_URL`.
- **E-mail OTP:** 6-digit code. For a first sign-up the front end tries `type: email`, then `type: signup`.
- **Web `.env` variables:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ADMIN_SUPABASE_URL`, `ADMIN_SUPABASE_ANON_KEY`, and `MAPBOX_API_KEY` (public `pk.` token, restricted to the site URLs). `MAPBOX_STYLE` is optional. The `FIREBASE_*` and `GOOGLE_*` variables are not used by the web app.
