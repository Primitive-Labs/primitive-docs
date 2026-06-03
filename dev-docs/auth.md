# auth — `client` (authentication)

Sign users in (OAuth, magic link, OTP, passkeys), enable offline access, read auth config, and log out. These methods live directly on the client, not under a sub-API.

::: warning Swift parity gap
Most of the auth surface is **dual** but the Swift client is largely untyped: `getAuthConfig`/`getAppConfig`/`magicLinkVerify`/`otpVerify`/`enableOfflineAccess` return `[String: Any]` where JS returns named objects, and the OAuth/magic-link/OTP methods lack the JS `inviteToken`/`waitlist` options. `logout` and `enableOfflineAccess` options also diverge — and there are two **behavioral** gaps beyond shape: Swift's `logout` skips the server `/auth/logout` cookie clear, and Swift's offline-access biometric default is inverted vs JS. Both clients compile; the Swift examples use dict access and the narrower Swift signatures. Tracked under [#964](https://github.com/Primitive-Labs/js-bao-wss/issues/964) (option/behavioral gaps) and [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954) (untyped dicts). Per-method divergences are noted inline.
:::

## OAuth

### checkOAuthAvailable()

Check whether OAuth sign-in is configured for this app.

::: code-group
<<< ./snippets/auth/check-oauth-available.ts#example{ts} [JavaScript]
<<< ./snippets/auth/check-oauth-available.swift#example{swift} [Swift]
:::

### startOAuthFlow(continueUrl?, options?)

Start the OAuth flow.

::: tip Divergent shape
JS redirects the page in place and returns `void`, accepting `{ waitlist, inviteToken }`. Swift takes a required `redirectUri:`, returns the authorization `URL` for you to open (e.g. in `ASWebAuthenticationSession`), and has no `waitlist`/`inviteToken` options ([#964](https://github.com/Primitive-Labs/js-bao-wss/issues/964)).
:::

::: code-group
<<< ./snippets/auth/start-oauth-flow.ts#example{ts} [JavaScript]
<<< ./snippets/auth/start-oauth-flow.swift#example{swift} [Swift]
:::

### handleOAuthCallback(code, state)

Complete the OAuth flow with the code + state returned by the provider.

::: code-group
<<< ./snippets/auth/handle-oauth-callback.ts#example{ts} [JavaScript]
<<< ./snippets/auth/handle-oauth-callback.swift#example{swift} [Swift]
:::

### exchangeOAuthCode(params) *(static)*

Static helper to exchange an OAuth code for a token without constructing a client.

::: tip Divergent shape
JS takes a single params object (with optional `refreshProxyBaseUrl`/`refreshProxyCookieMaxAgeSeconds`); Swift takes named arguments and has no refresh-proxy options ([#964](https://github.com/Primitive-Labs/js-bao-wss/issues/964)).
:::

::: code-group
<<< ./snippets/auth/exchange-oauth-code.ts#example{ts} [JavaScript]
<<< ./snippets/auth/exchange-oauth-code.swift#example{swift} [Swift]
:::

## Magic link

### magicLinkRequest(email, options?)

Email a magic sign-in link to the user.

::: tip Divergent shape
JS returns `{ success }` and `redirectUri` is optional; Swift requires `redirectUri:` and returns a bare `Bool` ([#964](https://github.com/Primitive-Labs/js-bao-wss/issues/964)).
:::

::: code-group
<<< ./snippets/auth/magic-link-request.ts#example{ts} [JavaScript]
<<< ./snippets/auth/magic-link-request.swift#example{swift} [Swift]
:::

### magicLinkVerify(token, options?)

Verify a magic-link token and sign the user in.

::: tip Divergent shape
JS returns a typed `{ user, isNewUser, promptAddPasskey }` and accepts `{ inviteToken }`; Swift returns an untyped `[String: Any]` and has no `inviteToken` option ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954), [#964](https://github.com/Primitive-Labs/js-bao-wss/issues/964)).
:::

::: code-group
<<< ./snippets/auth/magic-link-verify.ts#example{ts} [JavaScript]
<<< ./snippets/auth/magic-link-verify.swift#example{swift} [Swift]
:::

## OTP

### otpRequest(email)

Email a one-time password (OTP) code to the user.

::: tip Divergent shape
JS returns `{ success }`; Swift returns a bare `Bool` ([#964](https://github.com/Primitive-Labs/js-bao-wss/issues/964)).
:::

::: code-group
<<< ./snippets/auth/otp-request.ts#example{ts} [JavaScript]
<<< ./snippets/auth/otp-request.swift#example{swift} [Swift]
:::

### otpVerify(email, code, options?)

Verify an OTP code and sign the user in.

::: tip Divergent shape
JS returns a typed `{ user, isNewUser }` and accepts `{ inviteToken }`; Swift returns an untyped `[String: Any]` and has no `inviteToken` option ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954), [#964](https://github.com/Primitive-Labs/js-bao-wss/issues/964)).
:::

::: code-group
<<< ./snippets/auth/otp-verify.ts#example{ts} [JavaScript]
<<< ./snippets/auth/otp-verify.swift#example{swift} [Swift]
:::

## Passkeys

::: warning No Swift equivalent (by design)
The `passkey*` methods are **JavaScript-only on purpose**. The JS client implements WebAuthn over the wire because browsers have no clean native SDK; iOS apps instead use Apple's system passkey UI via `AuthorizationServices` (`ASAuthorizationPlatformPublicKeyCredentialProvider`) and hand the resulting attestation to the server. This is a documented intentional exclusion, not a parity gap ([`swift-client/docs/exclusions-v1.md`](https://github.com/Primitive-Labs/js-bao-wss/blob/main/swift-client/docs/exclusions-v1.md), native proposal [#929](https://github.com/Primitive-Labs/js-bao-wss/issues/929)).
:::

### passkeyAuthStart()

Start passkey sign-in: returns WebAuthn challenge options for the browser.

<<< ./snippets/auth/passkey-auth-start.ts#example{ts} [JavaScript]

### passkeyAuthFinish(credential, challengeToken)

Finish passkey sign-in with the browser's WebAuthn credential response.

<<< ./snippets/auth/passkey-auth-finish.ts#example{ts} [JavaScript]

### passkeyRegisterStart()

Start registering a new passkey for the current user.

<<< ./snippets/auth/passkey-register-start.ts#example{ts} [JavaScript]

### passkeyRegisterFinish(credential, challengeToken, deviceName?, options?)

Finish passkey registration with the browser's WebAuthn credential response.

<<< ./snippets/auth/passkey-register-finish.ts#example{ts} [JavaScript]

### passkeyList()

List all passkeys registered for the current user.

<<< ./snippets/auth/passkey-list.ts#example{ts} [JavaScript]

### passkeyDelete(passkeyId)

Delete a registered passkey by id.

<<< ./snippets/auth/passkey-delete.ts#example{ts} [JavaScript]

### passkeyUpdate(passkeyId, params)

Update a passkey's metadata (e.g. rename its device).

<<< ./snippets/auth/passkey-update.ts#example{ts} [JavaScript]

## Offline access

### enableOfflineAccess(options?)

Enable offline access using a passkey (largeBlob) or PIN-based grant. Requires online connectivity.

::: warning Swift parity gap
JS's `EnableOfflineAccessOptions` accepts `{ preferBiometric, allowPinFallback, ttlDays, retention, pinProvider }`; Swift exposes only `ttlDays` plus a **Swift-only `requireBiometric` flag** — the `preferBiometric`/`allowPinFallback`/`retention`/`pinProvider` options are all missing (sweep auth D1). The defaults also diverge: Swift's `requireBiometric` **defaults to `true`** (→ a `"biometric"` grant), whereas JS defaults to the non-biometric `"signed"` grant method (sweep auth D2). Finally, Swift returns an untyped `[String: Any]` instead of JS's typed `{ enabled, method?, reason? }` (sweep auth D6). All three are undocumented offline-access gaps ([#964](https://github.com/Primitive-Labs/js-bao-wss/issues/964), [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

::: code-group
<<< ./snippets/auth/enable-offline-access.ts#example{ts} [JavaScript]
<<< ./snippets/auth/enable-offline-access.swift#example{swift} [Swift]
:::

## Config & state

### isAuthenticated()

Check whether the client currently holds a valid auth token (synchronous, local).

::: code-group
<<< ./snippets/auth/is-authenticated.ts#example{ts} [JavaScript]
<<< ./snippets/auth/is-authenticated.swift#example{swift} [Swift]
:::

### getAuthConfig()

Fetch the full auth configuration (providers, passkey/OTP/magic-link flags, redirect URIs).

::: warning Swift parity gap
JS returns a typed `AuthConfig` object with 14 named fields; Swift returns the raw `[String: Any]` envelope, so callers must reach in by string key with no compile-time field names (sweep auth D4, [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

::: code-group
<<< ./snippets/auth/get-auth-config.ts#example{ts} [JavaScript]
<<< ./snippets/auth/get-auth-config.swift#example{swift} [Swift]
:::

### getAppConfig()

Fetch the app-launch config subset (mode, waitlist, available auth methods).

::: warning Swift parity gap
JS returns a typed `AppConfig` object with 7 named fields; Swift returns the raw `[String: Any]` envelope, so the app-launch config must be read by string key with no typed shape (sweep auth D4, [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

::: code-group
<<< ./snippets/auth/get-app-config.ts#example{ts} [JavaScript]
<<< ./snippets/auth/get-app-config.swift#example{swift} [Swift]
:::

## Logout

### logout(options?)

Sign the user out: best-effort server cookie clear, tear down networking, clear auth state, and optionally evict local data.

::: warning Swift parity gap
JS accepts `{ redirectTo, wipeLocal, revokeOffline, clearOfflineIdentity, waitForDisconnect }`; Swift exposes only `wipeLocal:`. Beyond the options gap, Swift's `logout` also **skips the server `/auth/logout` POST** that clears the auth cookie — it only tears down local state — so the session cookie can linger server-side. JS performs the best-effort server cookie clear described above; Swift currently does not (sweep auth D8, [#964](https://github.com/Primitive-Labs/js-bao-wss/issues/964)).
:::

::: code-group
<<< ./snippets/auth/logout.ts#example{ts} [JavaScript]
<<< ./snippets/auth/logout.swift#example{swift} [Swift]
:::
