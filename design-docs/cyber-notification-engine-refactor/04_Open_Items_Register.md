# Cyber Incident Management — Open Items Register

> A flat backlog of everything parked, deferred, or flagged for future confirmation during this design session. Nothing here blocks the Refactor Specification — these are genuinely separate from go-live scope.

---

## Design-only, not yet built (as of 25 Aug 2026 session)

- SOCI Significant Notification, SOCI Relevant Notification, Assess Suspect Data Breach, and Notify OAIC and affected individuals are all fully designed (Refactor Specification §B.4–B.5, this register) but **none are built in the PDI yet**. Flagged explicitly so this register isn't misread later as describing shipped behaviour.

---

## Needs external/legal confirmation (not buildable from public sources alone)

- **FIRB Data and Security Conditions.** The general FIRB/national-security-business framework was confirmed, but the specific claim of a standardised "Data and Security Conditions" clause requiring concurrent Treasury notification could not be verified — FIRB conditions are bespoke per company's actual No Objection Notification, not public law. **Action:** legal/compliance team to retrieve and review the actual conditions document. If a genuine obligation is confirmed, it slots into the Regulatory Notification Task table as an additional Notification Type with minimal extra build work.
- **Energy-sector-specific reporting obligations** (AEMO, AER, Energy Safe Victoria, or similar). Flagged as a possibility given the organisation's sector, not verified. Worth a dedicated research pass, separate from this session.
- **Asset class mandatory-reporting status under SOCI (Application) Rules s5 (LIN 22/026).** Confirm whether this organisation's specific asset class is on the mandated list, or whether SOCI reporting here is best-practice voluntary reporting built to the same standard. Doesn't change the build either way, but matters for internal framing.

---

## Parked for a dedicated future session

- **Persistent Threat → out-of-band communications mechanism.** Explicitly scoped for its own design session, tied into the playbook work (Lab 22a). Trigger condition is already defined: `Persistent Threat = true AND Confirmed SOCI Classification = Significant`.

---

## Future release (post go-live), design intentionally deferred

- **CMDB-driven Affected Asset Type.** Go-live ships a flat analyst-set field; future release derives a suggestion from Affected CIs + Impacted CIs (Business Service "Delivers Regulated/Essential Service" flag). Same downstream interface either way — see Architecture Decisions §5.
- **SOI (Sensitive Operational Information) internal routing.** Confirmed shape (visibility-only, team/group, not an approver) but the specific group and exact mechanism (own Regulatory Notification Task entry vs. simple Watch list addition) are undecided.
- **Resolved / Resolved By mandatory or auto-populated at Closure.** Currently non-mandatory even at Closed state. Flagged as a known gap with an explicit future-work intent, not an oversight.

---

## Build-adjacent items needing a decision before or during build

- **Service/Business Criticality field — check before building.** If Service Mapping/CSDM plugins are active on the PDI, `cmdb_ci_service` may already carry a native Business Criticality field. Worth checking before adding a duplicate custom field — extending a native CMDB field is the stronger CAD talking point.
- **NDB statement content requirements** (Privacy Act s26WL — entity identity/contact, description of breach, kinds of information involved, recommended steps for individuals). Not yet built into Lab 08 email templates.
- **"Serious harm" assessment factors** (sensitivity of data, encryption status, who obtained it, realistic risk of misuse). Currently a judgement call captured within the Eligible Data Breach Determination Approval, not a structured checklist. Candidate for refinement into a structured field set if it proves too vague once real incidents are run through it.
- **MIM routing escalation level.** Confirmed as a static assignment group for now. If the organisation's actual MIM process uses an on-call roster instead, that's a more involved future build, not a go-live blocker.
- **REG task State Transition Matrix.** A Lab-24-style matrix, but dimensioned by Notification Type — valid states differ per type (e.g. `Oral Notification Done` is meaningless on a Cyber Security Act – Ransomware Payment Report task). Deliberately deferred to when that specific build task is reached — a scoping call, not a gap.
- **Dependent Choice List + server-side validation for the REG task `State` field.** Two separate deliverables: the Dependent Choice List config (filters which `State` values are selectable per `Notification Type` on the form) and a Business Rule/ACL enforcing the same restriction against non-form writes (API, Import Set, background script). Building only the first leaves the rule enforceable in the UI and nowhere else.
- **Final labels for the REG task's 3 Closed-type states.** Referenced throughout this session's design (Stop Condition equivalence rules in Refactor Specification §B.3–B.5) but not yet named. Needs resolving before the Dependent Choice List or any Stop Condition can actually be built.

---

## Documentation/process actions outside ServiceNow entirely

- **Document monitoring response time commitments** (SOC/security team SOPs — business-hours triage windows, on-call escalation timing for after-hours alerts). The "Date/Time Became Aware" deeming calculation cannot be built correctly until this organisational documentation exists — there's currently nothing to anchor the calculation to. This is genuinely a process gap the design work surfaced, not a ServiceNow task.
- **MIM engagement trigger rule.** Documented in the Refactor Specification (§B.8) but lives in the standalone MIM runbook, not in ServiceNow. Worth confirming it actually gets written into that process documentation, since no system reminder will surface it otherwise.
