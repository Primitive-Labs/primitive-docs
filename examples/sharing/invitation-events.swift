import JsBaoClient

// Subscribe to invitation lifecycle events. Targeting is asymmetric: most
// actions reach one side only (created/updated/cancelled -> invitee;
// declined -> both; accepted -> inviter). Treat unknown actions as no-ops.
func wireInvitationEvents(client: JsBaoClient) -> EventSubscription {
  // #region example
  let sub = client.events.on(.invitation) { (event: InvitationEvent) in
    switch event.action {
    case "created":   break  // invitee only
    case "updated":   break  // invitee only
    case "cancelled": break  // invitee only
    case "declined":  break  // both invitee and inviter
    case "accepted":  break  // inviter only — event.acceptedBy carries the userId
    default:          break  // future-proof: no-op, don't throw
    }
  }
  // #endregion example
  return sub
}
