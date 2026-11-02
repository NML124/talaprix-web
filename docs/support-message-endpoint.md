# Edge function `post-support-message`

The `/contact` page of the web app ("Nous contacter" and "Signaler un problème") sends its form to this Supabase edge function. The front end is already wired (`SupportApi` in `libs/home/data-access/src/lib/support-api.ts`). This document describes what the backend must implement.

Until the function is deployed, the call returns 404. The page then shows "L'envoi depuis le site n'est pas encore disponible" and offers to send the prepared message by e-mail or WhatsApp. Nothing is lost.

## Request

`POST {SUPABASE_URL}/functions/v1/post-support-message`

Headers sent by the web app:

| Header          | Value                                                        |
| --------------- | ------------------------------------------------------------ |
| `apikey`        | anon key                                                     |
| `Authorization` | `Bearer <user access token>` if signed in, else the anon key |
| `Content-Type`  | `application/json`                                           |

Body:

```json
{
  "kind": "problem",
  "name": "Merdi",
  "email": "client@example.com",
  "topic": "Prix incorrect",
  "message": "Le prix affiché pour l'iPhone 15 chez X n'est plus à jour.",
  "page_url": "https://talaprix.com/produit/64a0a250-8411-4885-a720-95baef3bbea0"
}
```

| Field      | Type                       | Rules                                                                      |
| ---------- | -------------------------- | -------------------------------------------------------------------------- |
| `kind`     | `"contact"` \| `"problem"` | Required.                                                                  |
| `name`     | string \| null             | Optional, trim, max 120 characters.                                        |
| `email`    | string                     | Required, valid e-mail, lowercase, max 254 characters.                     |
| `topic`    | string                     | Required, one of the topics below (reject anything else).                  |
| `message`  | string                     | Required, 10 to 2000 characters after trim.                                |
| `page_url` | string \| null             | Only for `problem`. Accept only `https://talaprix.com/...` URLs (or null). |

Topics shown by the form:

- `contact`: Question générale, Mon compte, Devenir partenaire, Presse et partenariats, Autre.
- `problem`: Prix incorrect, Produit ou offre introuvable, Boutique fermée ou mauvaise adresse, Problème sur le site, Contenu inapproprié, Autre.

## Responses expected by the front end

| Status  | Body                                   | Front-end behaviour                                          |
| ------- | -------------------------------------- | ------------------------------------------------------------ |
| 200/201 | `{ "success": true }`                  | "Message envoyé" confirmation.                               |
| 400     | `{ "error": "<message en français>" }` | The French message is shown under the form.                  |
| 404     | (function not deployed)                | E-mail / WhatsApp fallback (see above).                      |
| 429     | `{ "error": "..." }`                   | "Trop de messages envoyés. Réessayez dans quelques minutes." |
| 5xx     | `{ "error": "..." }`                   | The message is shown; the user can retry.                    |

Also answer the CORS preflight (`OPTIONS`) like the other functions (`Access-Control-Allow-Origin`, `-Headers: authorization, x-client-info, apikey, content-type`, `-Methods: POST, OPTIONS`).

## Suggested implementation

1. **Table** (migration):

   ```sql
   create table public.support_messages (
     support_message_id uuid primary key default gen_random_uuid(),
     kind text not null check (kind in ('contact', 'problem')),
     name text,
     email text not null,
     topic text not null,
     message text not null,
     page_url text,
     user_id uuid references auth.users (id) on delete set null,
     ip_hash text,
     status text not null default 'new' check (status in ('new', 'in_progress', 'closed')),
     created_at timestamptz not null default now()
   );
   alter table public.support_messages enable row level security;
   -- No public policy: only the service role (edge function, admin) reads/writes.
   create index support_messages_created_at_idx on public.support_messages (created_at desc);
   ```

2. **Function**:
   - Validate the body with the rules above.
   - Read the user from the `Authorization` header when it is a user token, and keep `user_id`.
   - Rate limit, for example 5 messages per hour per e-mail and per hashed IP, by counting rows in `support_messages`. Return 429 beyond that.
   - Insert the row with the service role.
   - Send the e-mail to `support@talaprix.com` with `Reply-To` set to the visitor's e-mail. Use the SMTP already configured for GoTrue (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_ADMIN_EMAIL`, passed to the functions container), or a provider such as Resend or Brevo.
     - Subject: `[Signalement] <topic>` or `[Contact] <topic>`.
   - If the e-mail fails after the insert, still return 200: the message is saved and visible in the admin.
   - Return `{ "success": true }`.

3. **Admin (optional)**: list `support_messages` in the admin app to follow up and close requests.

## Front-end protections already in place

- Validation: e-mail, message of 10 to 2000 characters, and a character counter.
- Hidden honeypot field: if a bot fills it, the form shows success without calling the API.
- The button is disabled while sending, so a request can't be sent twice.

The backend must still revalidate everything: never trust the client.
