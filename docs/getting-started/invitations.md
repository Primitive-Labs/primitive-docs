# Invitations

How do people get into your app? Primitive treats app membership as a first-class concept: every app has an **access mode** that decides who can sign up, an **invitation system** for bringing specific people in, and automatic resolution of anything that was shared with someone *before* they became a user — so a new user's first sign-in lands them in an app where their team, documents, and permissions are already in place.

## Access Modes

| Mode | Who can join |
|---|---|
| `public` | Anyone can sign up |
| `invite-only` | Only people with an invitation |
| `domain` | Anyone with an email on your allowed domains (e.g. `@mycompany.com`) |

Set the mode from the CLI or the Admin Console:

```bash
primitive apps update --mode invite-only
```

## The Waitlist

Invite-only apps can collect a waitlist: visitors who try to sign up leave their email, and admins invite them when ready — one at a time, or in batches as you scale capacity:

```bash
# See who's waiting
primitive waitlist list

# Invite one entry (optionally sending the invitation email)
primitive waitlist invite <waitlist-id> --send-email

# Invite the next N in line
primitive waitlist bulk-invite --count 10
```

## Inviting Users

Admins and app owners can always invite:

```bash
primitive users invite alice@example.com
```

Or from your app:

::: code-group

<<< ../../examples/invitations/create.ts#example{ts} [JavaScript]

<<< ../../examples/invitations/create.swift#example{swift} [Swift]

:::

The invitee receives an email. The invitation is consumed when they sign up with the invited email, or when they accept it under a different account using the invitation's token (see [How Invitations Resolve](#how-invitations-resolve)).

### Member Invitations (with Quotas)

By default only admins can invite. To let regular members invite teammates, enable member invitations in your app settings. Two fields control the behavior:

| Field | Meaning |
|---|---|
| `memberInvitationsEnabled` | If `true`, users with role `"member"` can create invitations |
| `memberInvitationLimit` | Max active (non-accepted, non-expired) invitations per member |

Set both with the CLI (a limit of `0` means unlimited):

```bash
primitive apps update --member-invitations-enabled true --member-invitation-limit 5
```

Admins and owners are exempt from the quota, and members can only invite other members (passing `role: "admin"` is rejected). Members check their quota before showing an invite UI:

::: code-group

<<< ../../examples/sharing/invitation-quota.ts#example{ts} [JavaScript]

<<< ../../examples/sharing/invitation-quota.swift#example{swift} [Swift]

:::

Inviting over the quota returns a `403` with `error: "INVITATION_LIMIT_REACHED"`.

### Listing and Canceling

::: code-group

<<< ../../examples/sharing/invitation-list.ts#example{ts} [JavaScript]

<<< ../../examples/sharing/invitation-list.swift#example{swift} [Swift]

:::

`delete` cascades — any pending document shares, group adds, or collection adds attached to the invitation are removed in the same operation.

### Sending Your Own Invitation Emails

By default the platform sends invitation emails. To send branded emails from your own provider instead, suppress the platform email and drop the invitation's `inviteToken` into your own CTA URL:

::: code-group

<<< ../../examples/sharing/invitation-custom-email.ts#example{ts} [JavaScript]

<<< ../../examples/sharing/invitation-custom-email.swift#example{swift} [Swift]

:::

To look up the token for an existing invitation later — e.g. on a "resend invite" button — use `client.invitations.get(invitationId)`, which returns the full invitation including `inviteToken`.

## Sharing with People Who Aren't Users Yet

Invitations carry more than app membership. When you [share a document](./working-with-documents.md#sharing-documents), add someone to a [group](./users-and-groups.md#managing-members), or add them to a [collection](./working-with-documents.md#collections) **by email**, and that email isn't a user yet, the platform creates an invitation and remembers the pending grant. The same `inviteToken` pattern applies — those APIs return it on their deferred branch (`status: "pending_signup"`), so custom invitation emails work for every flow.

When the recipient becomes a user, everything waiting for them applies atomically:

::: code-group

<<< ../../examples/sharing/invite-onboarding.ts#example{ts} [JavaScript]

<<< ../../examples/sharing/invite-onboarding.swift#example{swift} [Swift]

:::

## How Invitations Resolve

There are two resolution paths — **apps don't pick which one runs; the recipient does**, by what they click and which email they sign in with.

### Path A — Sign up with the invited email (automatic)

The common case. The recipient clicks the invite link, lands on your app, and signs up using the same email the invitation was sent to — with any sign-in method. The signup detects the email match and resolves **every** pending grant linked to that invitation in one transaction: app membership, document shares, group adds, collection memberships. No `accept` call needed.

### Path B — Accept under a different identity (explicit)

The recipient is signed in (or wants to sign in) under a **different** email than the invitation was sent to — invited at `work@example.com`, signing in with `home@gmail.com` — or they're an existing user binding a fresh grant to their current account. The platform can't infer intent from the email, so the app calls accept explicitly with the invitation token:

::: code-group

<<< ../../examples/sharing/accept-invitation.ts#example{ts} [JavaScript]

<<< ../../examples/sharing/accept-invitation.swift#example{swift} [Swift]

:::

The invitation is marked accepted (write-once) and every grant linked to it is bound to the **currently signed-in user**, regardless of the email the invite was sent to.

### What Your App Wires Up

The `inviteToken` carries the invitation across the wire. The platform's default emails point recipients at `${baseUrl}/invite/accept?inviteToken=...`; if you send your own emails you can put the token in any URL your app knows how to read.

Whatever URL the recipient lands on, the page handles three states:

1. **Signed-in invitee** — confirm "Accept with this account?", then call `client.invitations.accept(inviteToken)` and redirect into the app.
2. **Signed-out invitee** — stash the token (e.g. `sessionStorage`), send them through your login flow, and pass the token to whichever auth verify call the user ends up on (`magicLinkVerify`, `otpVerify`, `passkeyRegisterFinish`, `startOAuthFlow`) — the server resolves the grants atomically with signup, no second click needed.
3. **Errors** — any invalid, expired, or already-used token returns `401 INVITE_TOKEN_INVALID`; show one clear "this invitation is no longer valid" message with a path to request a new invite.

**The web template ships all of this** — a landing page mounted at `/invite/accept` plus the token carry-over wired into every auth method. If you're using the template, just point invitation emails at `${yourApp.baseUrl}/invite/accept?inviteToken=${token}` and you're done. On iOS, resolve the incoming invite URL with `client.links` (see [Deep links and universal links](./authentication.md#deep-links-and-universal-links)), then follow the same three states: `accept(inviteToken)` when signed in, or — when signed out — hold the token and pass it to a sign-in method that carries one: `magicLinkVerify`, `otpVerify`, `signInWithGoogle(inviteToken:)`, or `signInWithApple(inviteToken:)` — each resolves the invitation atomically as part of a first sign-in, so no follow-up `accept` call is needed. A repeat sign-in from an existing Apple identity doesn't resolve `inviteToken` this way — call `invitations.accept(inviteToken)` once signed in instead.

### Domain Re-Validation

In `domain` mode, pending grants are re-validated at resolution time. A share to `alice@external.com` won't land if the app only accepts `@mycompany.com` — the invitation is rejected at signup rather than granting access silently.

### Cascade on Revoke

Revoking an invitation also removes every pending grant attached to it — there's no risk of an orphan share activating after you change your mind.

## Reacting to Invitation Events

Subscribe to the `invitation` event to react to lifecycle changes — for example, refreshing a members list when an invitee accepts. The action is on `event.action`; most actions are delivered to one side of the invitation only (`accepted` goes to the inviter).

::: code-group
<<< ../../examples/sharing/invitation-events.ts#example{ts} [JavaScript]
<<< ../../examples/sharing/invitation-events.swift#example{swift} [Swift]
:::

## Next Steps

- **[Working with Documents](./working-with-documents.md#sharing-documents)** — Sharing the documents your invitees will land in
- **[Users and Groups](./users-and-groups.md)** — Group membership and roles
- **[Authentication](./authentication.md)** — The sign-in flows that consume invitations
