# 6. Network Operations

**Status:** General framework; add approved diagrams, inventory, monitoring sources, and vendor-specific runbooks.

## Purpose
Help network operators diagnose connectivity, routing, DNS, wireless, VPN, device, and service availability issues while minimizing collateral impact.

## Troubleshooting walkthrough
1. Confirm the affected user/site/service, start time, symptoms, and scope.
2. Check monitoring and known incidents; determine whether impact is local, site-wide, regional, or global.
3. Review recent approved changes and dependencies.
4. Gather authorized read-only diagnostics first: link/interface state, reachability, name resolution, route path, VPN status, and relevant logs.
5. Compare observed behavior with the approved topology and baseline.
6. Follow the service-specific runbook. Do not make broad routing, firewall, DNS, or access-control changes without authorization.
7. For a change, record the before-state, scope, expected result, rollback, and required approval.
8. Validate from the affected perspective and monitor for recurrence.
9. Update the incident/ticket with findings, affected services, mitigation, and follow-up tasks.

## Escalation
Escalate to the network lead for complex routing or architecture issues; to Security Operations for suspicious traffic or suspected compromise; to the War Room for major multi-service impact; and to the configured provider/vendor contact when external dependencies are implicated.

## HelpBuddy safeguards
Never assume a topology, IP address, device name, or live monitoring status that has not been retrieved from an authorized source. Do not expose sensitive network diagrams or management addresses to unauthorized users. Confirm actual system state before claiming connectivity has been restored.

## Required local content
Maintain current topology diagrams, address/DNS conventions, device inventory, critical circuit/provider details, monitoring links, approved maintenance windows, standard diagnostic commands, change/rollback procedures, and escalation contacts under appropriate access controls.