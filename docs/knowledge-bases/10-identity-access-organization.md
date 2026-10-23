# 10. Identity, Access & Organization

**Status:** Access design guidance; map to the verified identity provider, application schema, and server-side policies before operational use.

## Purpose
Explain how identities, organizations, tenants, roles, permissions, and subscription entitlements work together.

## Core distinctions
- **Authentication:** proves which identity signed in.
- **Organization/tenant membership:** establishes the user's permitted organizational scope.
- **Role/permission:** controls which actions and records the user may access.
- **Subscription entitlement:** determines which purchased capabilities are enabled for the organization.
- **Operational authorization:** determines whether a particular action is allowed in its current context.

None of these should be substituted for another.

## Access walkthrough
1. Provision users through the approved identity and application onboarding process.
2. Link the authenticated identity to the correct profile and verified organization/tenant membership.
3. Assign the least-privileged role(s) needed for the user's job.
4. Apply required MFA/SSO and conditional-access policies where configured.
5. Verify access using positive and negative tests, including attempts to reach another tenant's records.
6. Review access after role changes, transfers, leave, or termination.
7. Remove or disable access promptly through the approved offboarding process.
8. Preserve appropriate audit records without retaining unnecessary secrets.

## HelpBuddy identity safety
Resolve identity from the authenticated session, not from a name or company ID typed in chat. Resolve tenant scope from verified membership and enforce it server-side. Never expose another tenant's tickets, profiles, messages, documents, or incidents based on user-provided identifiers.

## Troubleshooting
For missing access, verify the identity, active membership, role assignment, entitlement, and policy result in that order. Do not solve authorization errors by granting a broad administrator role. Record the minimum evidence needed and route unresolved issues to the identity/platform administrator.

## Secrets
Store credentials in approved secret-management facilities. Never put secrets in knowledge articles, tickets, prompts, code samples, or source control.