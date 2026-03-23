# Authentication

The template app comes with a complete authentication flow out of the box — login UI, token management, session handling, and multiple sign-in methods. You don't need to build any auth screens or wire up the client yourself.

The two things you may want to configure are:

1. **Email sign-in method** — Magic Link (default) or One-Time Password, controlled by a prop on the login component
2. **Google OAuth** — Optional, requires setting up a Google OAuth client

## Choosing Your Email Sign-In Method

The `PrimitiveLogin` component supports two email-based sign-in methods:

| Method | Value | How It Works |
|---|---|---|
| **Magic Link** (default) | `"magic_link"` | User receives a clickable sign-in link via email |
| **One-Time Password** | `"one_time_code"` | User receives a 6-digit code to enter in the app |

Set this via the `emailAuthMethod` prop on the `PrimitiveLogin` component in your login page:

```vue
<PrimitiveLogin
  appName="My App"
  defaultContinueRoute="home"
  emailAuthMethod="one_time_code"
/>
```

If you don't specify `emailAuthMethod`, it defaults to `"magic_link"`.

## Setting Up Google OAuth (Optional)

Google OAuth lets users sign in with their Google account. This requires a one-time setup in both the Google Cloud Console and your Primitive app.

### 1. Create a Google OAuth Client

Go to the [Google Cloud Console OAuth page](https://console.cloud.google.com/auth/clients) and create a Web application client:

| Setting | Value |
|---|---|
| Authorized JavaScript origins | `http://localhost:5173` |
| Authorized redirect URIs | `http://localhost:5173/oauth/callback` |

Note your **Client ID** and **Client Secret**.

::: tip Production Setup
When deploying to production, add your production domain to these settings alongside localhost.
:::

### 2. Configure in Primitive

```bash
primitive apps oauth set-google \
  --client-id YOUR_CLIENT_ID \
  --client-secret YOUR_CLIENT_SECRET

primitive apps origins add http://localhost:5173
```

Or configure via the [Admin Console](https://admin.primitiveapi.com/login) under your app's Google OAuth settings.

That's it — the template's login component automatically shows a "Sign in with Google" button when Google OAuth is configured.

## Passkeys (WebAuthn)

Passkeys let returning users sign in with biometrics (fingerprint, face) or hardware security keys. The template's login flow supports passkeys automatically — users can register a passkey after signing in, then use it for future logins.

## Email Template Customization

Customize the emails sent for magic links and OTP codes:

```bash
# View available template variables
primitive email-templates variables magic-link

# Set a custom template
primitive email-templates set magic-link \
  --subject "Sign in to MyApp" \
  --html-file ./magic-link.html \
  --text-file ./magic-link.txt

# Test the template
primitive email-templates test magic-link
```

## How It Works Under the Hood

For reference, here's what the template handles for you:

- **Token management** — Access tokens are short-lived and refreshed automatically in the background. Refresh tokens are stored securely.
- **Auth state** — The client emits `authStateChanged` events that the template's router uses to redirect between login and app pages.
- **Logout** — Calling `client.auth.logout()` clears tokens, closes documents, and fires the auth state event. The template's UI includes a logout button.
- **Safari compatibility** — The template's production deployment includes a first-party refresh proxy for Safari's strict cookie policies.

## Next Steps

- **[Users and Groups](./users-and-groups.md)** — Organize users and manage access control
- **[Overview](/)** — See how auth fits into the platform
