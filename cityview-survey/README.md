# CityView allocation form — React

A React conversion of `cityview-allocation-form-2.html`. Includes the original logo,
profile image, estate image, responsive styling and verbatim allocation terms.
No component library or external image hosting is needed. Poppins loads from Google
Fonts with local system-font fallbacks.

## Run

Use Node.js 22 LTS or newer.

```sh
npm install
npm run dev
```

```sh
npm run build
npm run preview
```

## Structure

- `src/AllocationForm.jsx`: reusable form, navigation and submission state.
- `src/components/TimelineStep.jsx`: controlled radio selection.
- `src/components/TermsStep.jsx`: scroll gate, acceptance and submission controls.
- `src/components/TermsContent.jsx`: original terms, rendered as JSX.
- `src/components/Confirmation.jsx`: acknowledgement and buyer email.
- `src/api.js`: production HTTP adapter.
- `src/main.jsx`: explicitly labelled demo and sample buyer.
- `src/styles.css`: original design with header-height and accessibility fixes.
- `src/assets/`: extracted original images.

## Connect your backend

The default app is a frontend preview. It does not persist responses or send emails.
In `main.jsx`, import `submitAllocation` from `./api` and render:

```jsx
<AllocationForm
  buyer={authenticatedBuyer}
  allocationId={allocation.id}
  onSubmit={submitAllocation}
/>
```

The buyer object requires `firstName`, `fullName`, and `email`; `avatarUrl` is optional.
Source these values and the allocation ID from your authenticated application.
Remount the form (for example, use `key={allocation.id}`) when switching allocations.

Implement `POST /api/allocation-notifications` on your server. The request contains
`allocationId`, `timeline`, `acceptedTerms: true`, `termsVersion`, and `idempotencyKey`.
The same idempotency key is also sent as an HTTP header and retained on retries.
Return JSON only after durable storage:

```json
{ "submissionId": "server-generated-id", "emailQueued": true }
```

The server must authorize the allocation for the signed-in buyer, validate the
allowed timeline and current terms version, record an authoritative acceptance
timestamp and terms snapshot, and enforce idempotency. Use your application's CSRF
protection for cookie authentication. Set `emailQueued` only if an email has actually
been queued; email delivery is a backend responsibility. Match `TERMS_VERSION` to
your canonical terms identifier before deployment. A scroll gate is a UI affordance,
not proof that somebody read the terms.

## Behaviour

Continue requires a timeline. Terms acceptance unlocks when the end is reached,
including when the content fits without scrolling. Returning to the first step
preserves the selection but requires a fresh acceptance. While submitting, navigation
and repeated submission are blocked. Failed requests retain the form for retry;
confirmation appears only after a valid acknowledgement. The adapter times out after
20 seconds. Focus moves to the heading on step changes; radios and the scrollable
terms remain keyboard accessible. Demo confirmation explicitly says nothing was saved.
