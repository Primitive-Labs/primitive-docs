import type { JsBaoClient } from "js-bao-wss-client";

// Subscribe to invitation lifecycle events. Targeting is asymmetric: most
// actions reach one side only (created/updated/cancelled -> invitee;
// declined -> both; accepted -> inviter). Treat unknown actions as no-ops.
export function wireInvitationEvents(client: JsBaoClient) {
  // #region example
  client.on("invitation", (event) => {
    switch (event.action) {
      case "created":   /* invitee only */ break;
      case "updated":   /* invitee only */ break;
      case "cancelled": /* invitee only */ break;
      case "declined":  /* both invitee and inviter */ break;
      case "accepted":  /* inviter only — event.acceptedBy carries the userId */ break;
      default: /* future-proof: no-op, don't throw */ break;
    }
  });
  // #endregion example
}
