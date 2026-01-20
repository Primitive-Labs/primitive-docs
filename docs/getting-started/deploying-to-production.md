# Deploying to Production

The template deploys to Cloudflare Workers. You'll need a Cloudflare account with access to deploy Workers.

## 1. Configure wrangler.toml

Edit `wrangler.toml` to set your worker name:

```toml
name = "my-app"

[env.production]
name = "my-app-prod"
```

By default, your app will be deployed to a `*.workers.dev` URL. To use a custom domain, uncomment and edit the routes section:

```toml
[[env.production.routes]]
pattern = "your-domain.com"
custom_domain = true
```

## 2. Configure .env.production

Edit `.env.production` with your production settings:

```bash
# Your Primitive App ID (can be the same as development or a separate production app)
VITE_APP_ID=your_production_app_id

# OAuth redirect URI for your production domain
VITE_OAUTH_REDIRECT_URI=https://my-app-prod.your-subdomain.workers.dev/oauth/callback
```

## 3. Deploy

```bash
pnpm cf-deploy production
```

The deploy script reads `.env.production`, builds the project, and deploys to Cloudflare Workers.

To pass additional flags to wrangler, use `--` followed by the flags:

```bash
pnpm cf-deploy production -- --dry-run
```

## Adding More Environments

You can add additional environments (e.g., test, staging) by:

1. **Adding a section to wrangler.toml:**

```toml
[env.test]
name = "my-app-test"

[env.test.vars]
REFRESH_PROXY_COOKIE_MAX_AGE = "604800"
REFRESH_PROXY_COOKIE_PATH = "/proxy/"
```

2. **Creating a corresponding .env file** (e.g., `.env.test`)

3. **Deploying:**

```bash
pnpm cf-deploy test
```

The deploy script reads from `.env.{environment}` and uses `[env.{environment}]` from wrangler.toml.
