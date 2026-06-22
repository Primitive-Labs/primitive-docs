# Agent Guide to Primitive Authentication

Implementing auth flows for Primitive apps. All methods live on `JsBaoClient` (package: `js-bao-wss-client`).

## Auth Methods

| Method | When to use |
|--------|-------------|
| OAuth (Google) | Primary auth, redirect-based |
| Magic Link | Passwordless email link |
| OTP | 6-digit email code (10 min expiry) |

Each method must be enabled in the Admin Console. Check availability with `getAuthConfig()` before showing UI.

## Client Setup (no template required)

All flows below run on a plain client — no starter template needed:

```swift
  let client = JsBaoClient(options: JsBaoClientOptions(
    apiUrl: "https://primitiveapi.com",
    wsUrl: "wss://primitiveapi.com",
    appId: "YOUR_APP_ID"
  ))

  // Wait for the bootstrap to restore a persisted session (if any).
  try await client.waitForAuthBootstrap()
  if client.isAuthenticated() {
    let userId = try await client.waitForUserId(timeout: 5)
    print("signed in as \(userId)")
  }
```

In the starter template this wiring is owned for you by `PrimitiveAppState.initialize()` + `PrimitiveAuthManager`.

## Discovering Available Methods

```swift
  let config = try await client.auth.getAuthConfig()
  // AuthConfigInfo: appId, name, mode, waitlistEnabled,
  //   googleOAuthEnabled, googleClientId, hasOAuth, redirectUris,
  //   passkeyEnabled, passkeyRpId, passkeyRpName, hasPasskey,
  //   magicLinkEnabled, otpEnabled

  let methods = (
    google: config.hasOAuth,
    magicLink: config.magicLinkEnabled,
    otp: config.otpEnabled,
    passkey: config.hasPasskey
  )
```

`hasOAuth` is true when Google OAuth is enabled (the flag defaults to enabled when both `googleClientId` and the server-side `googleClientSecret` are configured). `magicLinkEnabled` and `otpEnabled` default to `true` unless explicitly disabled in the Admin Console.

## Server App Settings ↔ Client Contract

Server-side app settings must align with the origin the client app is served from. Inspect with `primitive apps get`; the relevant fields:

| Server field | Contract | Set via |
|---|---|---|
| `corsAllowedOrigins` | Must contain the exact serving origin (scheme+host+port). `corsMode` defaults to `custom` — an empty list blocks every cross-origin request. | `primitive apps update --cors-origins "<o1>,<o2>"` |
| `redirectUris` | OAuth callbacks are validated against this whitelist — a non-listed callback URL returns 400 `Invalid redirect URI`. | Admin Console only (no CLI flag) |
| `baseUrl` | Used for links in auth emails / redirects. | `primitive apps update --base-url <url>` |
| Provider toggles | `--google-oauth`/`--magic-link`/`--otp <bool>` — what `getAuthConfig()` reports. | `primitive apps update` |


Dev → prod checklist: add the production origin to `corsAllowedOrigins`, add the production OAuth callback to `redirectUris` (Admin Console), update `baseUrl`, and re-check `getAuthConfig()` reports the expected methods.

---

## OAuth (Google)

### Start the flow

```swift
  let hasOAuth = await client.checkOAuthAvailable()
  if hasOAuth {
    // Open this URL in a browser / ASWebAuthenticationSession.
    let authUrl = try await client.startOAuthFlow(
      redirectUri: redirectUri,
      continueUrl: continueUrl
    )
    _ = authUrl
  }

  // On the callback (?code=&state=): token is stored, WS reconnects.
  try await client.handleOAuthCallback(code: code, state: state)
```

`startOAuthFlow(redirectUri:continueUrl:)` takes an explicit `redirectUri` and **returns** the authorization URL to open yourself (e.g. via `ASWebAuthenticationSession`). It throws `OAuth not configured` if OAuth is unavailable.

### Handle the callback (instance method — preferred)

When the callback page can construct a client (you already have the JWT or are happy to re-init), extract `code`/`state` from the callback and pass them to `handleOAuthCallback`:

```swift
  if !code.isEmpty && !state.isEmpty {
    try await client.handleOAuthCallback(code: code, state: state)
    // Token now stored, WebSocket reconnected. Navigate.
  }
```

### Handle the callback (static method — when no client yet)

```swift
  let token = try await JsBaoClient.exchangeOAuthCode(
    apiUrl: apiUrl,
    appId: appId,
    code: code,
    state: state
  )
  // Persist however your app does (e.g. Keychain), or pass to the client.
```


**Don't:**

```swift
// WRONG — handleOAuthCallback does not return the token; it stores it.
let token = try await client.handleOAuthCallback(code: code, state: state)
```

---

## Magic Link

### Request + verify

```swift
  // Request the email. Pass the magic-link callback redirect URI.
  _ = try await client.auth.magicLinkRequest(
    email: email,
    redirectUri: "https://app.example.com/auth/magic-callback"
  )

  // On the callback, read the `magic_token` value and verify it.
  let result = try await client.auth.magicLinkVerify(token: magicToken)
  // Token is now stored on the client and the WS auto-connects.
  let user = result.user
  let isNewUser = result.isNewUser ?? false
```

`auth.magicLinkRequest(email:redirectUri:)` takes the `redirectUri` as a required argument. `auth.magicLinkVerify(token:inviteToken:)` returns a `MagicLinkVerifyResult` (`.user`, `.promptAddPasskey?`, `.isNewUser?`).

### Reading the token (callback page)

The callback delivers the token as a `magic_token` value — **not** `token`, `magicToken`, or `code`:

```swift
  let magicToken = URLComponents(url: callbackURL, resolvingAgainstBaseURL: false)?
    .queryItems?.first(where: { $0.name == "magic_token" })?.value

  if let magicToken {
    let result = try await client.auth.magicLinkVerify(token: magicToken)
    // Token is now stored on the client and WS auto-connects.
    if result.isNewUser == true { showOnboarding() }
    if result.promptAddPasskey == true { offerPasskeyRegistration() }
  }
```


To accept an invitation server-side at verify time (so the deferred grant resolves to the signing-in user even when emails differ), pass `inviteToken`:

```swift
  let result = try await client.auth.magicLinkVerify(
    token: magicToken,
    inviteToken: inviteTokenFromUrl
  )
  let user = result.user
  let isNewUser = result.isNewUser ?? false
```

---

## OTP (Email Code)

```swift
  _ = try await client.auth.otpRequest(email: email)

  // User enters the 6-digit code from the email.
  let result = try await client.auth.otpVerify(email: email, code: code)
  // Token is now stored on the client and the WS auto-connects.
  let user = result.user
  let isNewUser = result.isNewUser ?? false
```

`auth.otpVerify(email:code:)` returns an `OtpVerifyResult` (`.user`, `.isNewUser?`).

### Error handling

`AuthError` is thrown for non-2xx responses with a machine-readable code:

```swift
  do {
    _ = try await client.auth.otpVerify(email: email, code: code)
  } catch let error as AuthError {
    switch error.code {
    case .invalidToken,          // bad/expired code
         .tokenExpired,          // token expired
         .invitationRequired,    // invite-only app, no invitation
         .domainNotAllowed,      // domain-mode app, email not in allowed domains
         .addedToWaitlist,       // waitlist enabled, user added
         .waitlistEntryUpdated,  // existing waitlist entry updated
         .magicLinkNotEnabled,   // magic link off in admin console
         .inviteTokenInvalid,    // bad invite token
         .inviteTokenExpired,    // invite token expired
         .inviteAlreadyAccepted: // invite already used
      showUserMessage(error.message)
    default:
      throw error
    }
  }
```

> **Caveat on OTP disabled.** When OTP is disabled the request endpoint returns a plain 400 with the message `"OTP authentication is not enabled for this app"` and **no `code` field**. Don't rely on a code to detect that case — gate the OTP UI on `getAuthConfig()`'s `otpEnabled` up front instead.

`AuthCode` also carries the SDK-generated cases `.tokenInvalid`, `.refreshFailed`, `.networkError`, and `.unauthorized`, plus `.passkeyNotEnabled` and `.memberInvitationsDisabled` from the server. Server codes outside the enum (e.g. rate limiting) arrive with `code == nil` — fall back to `error.message`.

The same `AuthError` codes apply to `magicLinkRequest`/`magicLinkVerify`.

---


---

## Auth Events

These are the canonical events.

`authFailed` and `authState` are the ones most apps must handle. Register handlers with `client.events.on(...)`, which delivers typed event structs and returns an `EventSubscription` — hold it for as long as you want the handler live:

```swift
  // Token refresh failed or server invalidated session — prompt re-login.
  let failed = client.events.on(.authFailed) { (event: AuthFailedEvent) in
    redirectToLogin()
  }

  // Token applied successfully (login, refresh, or OAuth callback).
  let success = client.events.on(.authSuccess) { (event: AuthSuccessEvent) in
    // event.cause names the operation that produced the token.
    // Treat unknown values as a generic success — the set may grow.
  }

  // Generic state-machine event — fires on transitions.
  let state = client.events.on(.authState) { (event: AuthStateEvent) in
    // event.authenticated, event.userId, event.mode (NetworkMode)
  }
```


### Minimal handler

```swift
  func promptLogin() { navigateToLogin() }
  let failed = client.events.on(.authFailed) { (_: AuthFailedEvent) in promptLogin() }
  let state = client.events.on(.authState) { (event: AuthStateEvent) in
    if !event.authenticated { promptLogin() }
  }
```

---

## Per-App User Disable

Admins can disable a user's access to a single app without deleting their global user account. The `AppUser` record carries:

| Field | Meaning |
|---|---|
| `status` | `"active"` or `"disabled"`. Missing/null is treated as `"active"`. |
| `disabledAt` | Timestamp the user was disabled. |
| `disabledBy` | `adminId` that performed the disable. |

When `status === "disabled"`:

- Every auth-completion endpoint (OAuth callback, magic-link verify, OTP verify, and any other sign-in path) rejects with `AUTH_USER_DISABLED` before issuing tokens.
- The user's open WebSocket connections are force-disconnected by the server's connection layer.
- Existing access tokens are revoked; in-flight workflow runs the user started are terminated.

Admin endpoints (admin token required):

```http
PUT /admin/api/apps/{appId}/users/{userId}/disable
PUT /admin/api/apps/{appId}/users/{userId}/enable
```

The admin console exposes the same toggles. App code does not need to special-case disabled users — the platform rejects them before they get an authenticated session. Make sure error UIs render `AUTH_USER_DISABLED` differently from generic auth errors so the user knows to contact an admin.

---

## Token Inspection & Manual Token

```swift
  let signedIn = client.isAuthenticated() // Bool

  // Wait until a userId is available.
  let userId = try await client.waitForUserId(timeout: 5)

  // Wait until authenticated AND offline DBs are ready. Returns the mode.
  let ready = try await client.waitForAuthReady(timeout: 6)
```

`isAuthenticated()` returns true when either an online JWT or an unlocked offline identity is present.

To read or manually set the token:

```swift
  // Manually set a token (e.g. obtained out-of-band). Triggers authSuccess
  // and pushes through the normal apply-token pipeline.
  client.updateToken(jwt, cause: "external")

  // Read the current token via the decoded JWT payload, or track it from the
  // authSuccess event.
  let payload = client.getJwtPayload()
```

**Don't:**

```swift
// WRONG — opening documents before auth is ready throws or fails silently.
let doc = try await client.openDocument(id)  // before try await client.waitForAuthReady()
```

---

## JWT Persistence

Optional — persists the JWT so a relaunch doesn't require re-authentication.

The client persists the token to the Keychain across app launches. `waitForAuthBootstrap()` restores any persisted session, so an authenticated user stays signed in on relaunch. Tokens within ~2 min of expiry are not reused, and are cleared on logout and on `authFailed`.

---

## Logout

```swift
  try await client.auth.logout(options: LogoutOptions(
    wipeLocal: true, // delete locally cached document data + KV cache
    waitForDisconnect: true // wait for the WS to close before resolving
  ))
```

`auth.logout(options:)` takes a `LogoutOptions` — `wipeLocal` (delete locally cached document data + KV cache), `revokeOffline` (also revoke any stored offline grant), `clearOfflineIdentity` (defaults `true`), `waitForDisconnect` (await WebSocket teardown before returning; defaults `false`).

---

## Auth State in Apps

Gate the app's main layout on auth state so child views can assume an authenticated user, and react to auth loss centrally. The starter template implements this gate; if you're not using it, replicate it.

The template ([swift-primitive-app-dev](https://github.com/Primitive-Labs/swift-primitive-app-dev)) provides `PrimitiveAppState` + `PrimitiveAuthManager` (`@Published isAuthenticated`/`userId`/`loginState`) and `AuthGateView`.

### Layout gate (recommended default)

`AuthGateView(appState:appName:authManager:) { content }` is the layout gate — it walks initializing → login (`PrimitiveLoginView`) → connecting → connected and only renders `content` when connected, so views inside never null-check the user:

```swift
AuthGateView(appState: appState, appName: "MyApp", authManager: authManager) {
  RootView()  // user guaranteed non-nil inside here
}
```

### Reactive observers (downstream state)

Subscribe to `authManager.$isAuthenticated` (Combine) to initialize or reset downstream state on transitions:

```swift
authManager.$isAuthenticated
  .sink { isAuth in
    if isAuth { Task { await myStore.initialize() } }
    else { myStore.reset() }
  }
  .store(in: &cancellables)
```

### Initialization order

1. Auth ready (`isAuthenticated` true, or `await client.waitForAuthReady()`)
2. Open documents (`documents.open(...)`)
3. Query data

Don't open documents or hit data APIs before step 1.

---

## Deferred Grant Resolution at Signup

Sign-in resolves any pending `DeferredDocumentPermission` and `DeferredGroupAdd` records for the user's email automatically inside `UserProvisioningService`.

Implications:

1. **Don't re-grant after signup.** If a doc was shared with the email pre-signup, the new user already has access — the deferred grant resolved automatically.
2. **Domain-mode apps re-validate at resolution.** Deferred grants for emails outside allowed domains are silently dropped.
3. **`invitation`/`accepted` WS events fire after resolution** — subscribe to refresh the inviter's UI.

See the [Invitations guide](AGENT_GUIDE_TO_PRIMITIVE_INVITATIONS.md#deferred-grants).

---


---

## Test User Sign-In (per-app whitelist)

There is **no `primitive test-users` CLI command**. The bypass is server-side: an OTP request for an email shaped like `<base-local>+primitivetest<suffix>@<base-domain>` accepts the magic code `"000000"` instead of the emailed code, but **only when the base address is on the app's `testAccountBaseEmails` whitelist**.

```swift
  // Requires the app owner to have added "alice@example.com" to the app's
  // testAccountBaseEmails whitelist. Then any `alice+primitivetest<suffix>@example.com`
  // derivative becomes a test account that accepts code "000000".
  _ = try await client.auth.otpRequest(email: "alice+primitivetest@example.com")
  _ = try await client.auth.otpVerify(email: "alice+primitivetest@example.com", code: "000000")
  // client is now authenticated; the access token expires in 30 minutes

  // Role-distinguished derivatives (Gmail/Workspace deliver them to the same inbox):
  _ = try await client.auth.otpRequest(email: "alice+primitivetest-teacher@example.com")
```

Guardrails:

- Per-app whitelist. The base address (`alice@example.com`) must be on the app's `testAccountBaseEmails` list — explicit owner consent.
- Only `+primitivetest<suffix>` derivatives are eligible. The bare base is never a test account.
- The derived user must already exist as an `AppUser` in this app — bypass never auto-provisions.
- Issued tokens are short-lived (~30 minutes) and carry a `primitiveBypass: true` claim that gets re-checked on every request, so removing the base from the whitelist revokes sessions immediately.
- `+primitivetest*` accounts can sign in as ordinary members but are reserved at admin / owner / invitation boundaries — they cannot hold those roles.

Manage the whitelist with `primitive apps update --test-account-bases …` (max 50 bases per app), or in the web-admin settings UI — both edit the same `testAccountBaseEmails` list.

**Don't use this in production user flows.**

---

## Customizing Email Templates

The Magic Link, OTP, and other emails Primitive sends can be customized via the CLI:

```bash
primitive email-templates list                       # all types + override status
primitive email-templates get magic-link             # subject + body + variables
primitive email-templates variables magic-link       # available {{vars}}
primitive email-templates set magic-link \
  --subject "Sign in to MyApp" \
  --html-file ./emails/magic-link.html \
  --text-file ./emails/magic-link.txt
primitive email-templates test magic-link            # send test email
primitive email-templates delete magic-link          # revert to default
```

Overrides are tracked by `primitive sync` (TOML in `email-templates/`). Custom templates can be triggered from `email.send` workflow steps — see the [Workflows guide](AGENT_GUIDE_TO_PRIMITIVE_WORKFLOWS.md).

---

## Implementation Checklist

1. Call `getAuthConfig()` to discover enabled methods before rendering UI.
2. Implement at least one primary method (OAuth or Magic Link).
3. Handle the OAuth callback (`code` + `state`) and the Magic Link `magic_token`.
4. Listen to `authFailed` and `onlineAuthRequired` (minimum) to prompt re-login.
5. Catch `AuthError` and switch on `error.code`.
6. Gate your app layout on `isAuthenticated` (via `AuthGateView`) so child views can assume an authenticated user.
7. Observe `authManager.$isAuthenticated` in downstream state (it changes both directions).
8. Sequence: auth ready → open documents → query data.
9. Customize email templates via CLI if you need branded auth emails.
