# Cyber Incident Management — Refactor Specification
## Organized by Subsystem

> **Purpose:** This document specifies every behavioural change designed in this session — logic, rules, ACLs, SLAs, and transitions. Field-level facts (names, types, choice values) live in the companion **Field Register** document; this document assumes that register as reference and focuses on *behaviour*.
>
> **Scope note:** This is a delta against the existing build (Labs 01–12), not a restatement of the whole app. The labs repo README remains ground truth for what's already built. Sequencing into specific labs is intentionally left to whoever has visibility into the full upcoming lab plan — this document describes *what* needs to change, not *which lab number* it belongs in.

---

## Subsystem A — ACSC Incident Severity

- Choice list values replaced: Critical/High/Medium/Low → C1, C2, C3, C4, C6 (no C5). See Field Register §1.1 for exact values and help text.
- Mechanical change only — `sys_choice` record edits on the existing field. No schema/field definition change.
- UI Policy governing ACSC Severity mandatory state has been revised — see Subsystem C for the new trigger condition.
- Existing Lab 08 email templates reference `${acsc_incident_severity}` — this field now lives on the parent Cyber Incident and is dot-walked into the ASD/SOCI notification task. Template references will need to be verified once notification task design is finalised in Labs 17–20.
- **Retires** the old ASD Notification auto-tick rule ("Severity = Critical"). Replacement rule is in Subsystem B.

---

## Subsystem B — Notification & Compliance Engine

### B.1 Classification logic

**Baseline lookup (Impact × Affected Asset Type → classification):**

| Impact | Regulated/Essential-Service | Corporate-Only |
|---|---|---|
| I1 — Full outage | Significant | Relevant |
| I2 — Widespread degradation | Significant | Relevant |
| I3 — Error, not blocking | Relevant | No report |
| I4 — No impact | No report | No report |

**Data Classification escalation floor:** if `Data Classification of Affected Assets` = Sensitive Operational Information, Private Information, **or** Critical Infrastructure Information → floor of at least **Relevant**, regardless of the lookup result. The floor can only raise the outcome, never lower it.

`Suggested SOCI Classification = MAX(lookup result, data classification floor)`

**Standing principle:** default to the higher/more severe rating whenever a case is genuinely ambiguous (e.g. I3/Regulated → Relevant, on the reliability prong of the relevant-impact test, even though "error not blocking" is a judgement call). This mirrors ACSC's own stated preference for over- rather than under-reporting.

**Human gate:** `Suggested SOCI Classification` is never auto-actioned. It must be **Confirmed** via the Legal Approval on the linked Regulatory Notification Task before anything downstream fires.

### B.2 Warning/info banner

- **Trigger condition:** `Suggested/Confirmed SOCI Classification ≠ No Report`. **Must check this single calculated field — not the individual inputs (Affected Asset Type, Data Classification) separately.** Checking inputs independently was an earlier draft design that created a real gap (a corporate-only, zero-availability-impact breach with Critical Infrastructure data wouldn't have tripped an input-level check, but does trip the classification-level check via the escalation floor).
- **Mechanism:** Display Business Rule (server-side, `when=display`) sets `g_scratchpad`; client picks it up via `g_form.addWarningMessage()` (At Risk) / `g_form.addErrorMessage()` (Breached or Significant/Relevant present).
- **Persistence:** fires on every form load while the condition holds — no dismiss-and-suppress behaviour. This is native `addWarningMessage`/`addErrorMessage` behaviour, requires no extra build to achieve "persistent until resolved."
- **Message content:** must state *why* it fired (e.g. "Flagged due to Affected Asset Type: Regulated/Essential-Service" vs. "...Data Classification: Critical Infrastructure Information") — a banner with no visible regulated CI on the form needs to explain itself.
- **Clears when:** the underlying Regulatory Notification Task(s) reach a completed/cancelled state, returning the rollup to "No Active Notifications."

### B.3 Regulatory Notification Task — shared mechanism

See Field Register §2 for the full field list. Behavioural rules:

- **Auto-creation trigger:** fires on successful record save when the Notification Type's specific trigger condition is met (see B.4–B.6) AND all required fields are populated. Task is created complete — no partially-populated child records. A **duplicate guard** prevents a second task of the same Notification Type being created if the record is edited and re-saved after the task already exists: condition is "no active task of this Notification Type already exists on this parent incident."
- **SLA clock:** starts from `Date/Time Became Aware` (analyst-set field) at the point the task is created — not from `sys_created_on` and not from when Suggested SOCI Classification was first calculated. The statutory clock is anchored to awareness time, not system processing time.
- **Assignment:** group = Cyber Security (confirmed: same group as the main incident, not a separate "Cyber Security Operations" group).
- **Legal:** Approval record (`sysapproval_approver`), not a checkbox. Runs in **parallel** with the task's SLA clock — legal review must not block the clock from running, since statutory deadlines don't pause for internal process.
- **MIM:** added to the task's native `Watch list` field on creation. Static assignment group (confirmed — not an on-call roster, parked as a future-work item if that's ever needed).
- **Downgrade/Cancel:** Cyber Security can edit Priority downward or cancel the task entirely if further review determines a lower classification or non-reportable outcome.
- **Multiple SLAs per task:** where a pathway has more than one clock (NDB), attach multiple SLA Definitions to the same task record — same native pattern ServiceNow uses for Incident Response + Resolution SLAs running concurrently on one record. Do not split into multiple tasks for this.
- **Task completion mechanism:** notification tasks complete via a shared `State` value, working name **"Oral Notification Complete"**, added to the Regulatory Notification Task's own `State` choice list — not via boolean+date tick fields. The value is filtered per Notification Type using a native Dependent Choice List (Dictionary "Depend on field" + `sys_choice` "Dependent value"), so it's hidden on task types where it doesn't apply (e.g. Ransomware Payment Report). **Dependent Choice Lists are client/form-side filtering only** — a Business Rule (or ACL) must independently validate that the saved `State` is legal for that task's `Notification Type`, since API calls, Import Sets, and background scripts bypass the form entirely.
  - Notification-Type-scoped state visibility: Oral Notification Complete is a SOCI-only state — it does not apply to and is not selectable on any other Notification Type (NDB, FIRB, or otherwise, per the current Notification Type list). This follows the same mechanism already specified above: the Dependent Choice List filters the value out of the form for non-SOCI task types, and the same Business Rule/ACL that validates State against Notification Type on save must independently enforce that Oral Notification Complete is only a legal saved value when Notification Type = SOCI. Form-side filtering alone does not stop the value being written via API, Import Set, or background script.
- **Closed-state equivalence:** this task table's `State` field two distinct Closed-type values (Closed Complete, Closed No Longer Required). Every Stop Condition on every SLA attached to this table, regardless of Notification Type, must treat both as equivalent to "Completed" for SLA purposes. This is a cross-cutting rule stated once here, not repeated per pathway in B.4–B.6.

### B.4 ASD/SOCI Notification (Security of Critical Infrastructure Act 2018, ss 30BC/30BD)

- **Trigger:** Confirmed SOCI Classification = Significant or Relevant
- **SLA — Significant:** 12hr oral/written notification; 84hr written follow-up if reported orally first
- **SLA — Relevant:** 72hr oral/written notification; 48hr written follow-up if reported orally first
- **Clock starts:** `Date/Time Became Aware`
- **Initial SLA stop condition:** stops when the task reaches **either** `State = Oral Notification Complete` **or** any Closed state — whichever occurs first. Written notification can satisfy the initial deadline directly, with no oral step required.
  - Scope note: Oral Notification Complete (referenced in the stop conditions above) is exclusive to this pathway — see §B.3 for the Notification-Type-scoped enforcement mechanism.
- **Follow-up SLA trigger (conditional, not always-on):** the 84hr (Significant) / 48hr (Relevant) written follow-up SLA only starts if `State = Oral Notification Complete` was reached before the initial deadline elapsed. If written notification satisfied the initial deadline directly, no follow-up SLA is created.
- **Follow-up SLA stop condition:** any Closed state (per B.3's equivalence rule).
- **Recipients:** urgent oral via 1300CYBER1 (1300 292 371); written via ACSC cyber incident reporting portal (cyber.gov.au)
- **Field automation:** `Notification required to ASD` (boolean) = true when Confirmed SOCI Classification ∈ {Significant, Relevant}. **This retires the old "Severity = Critical" rule entirely.**
- **Verification item (not a build task):** confirm whether your specific asset class sits on the SOCI (Application) Rules mandated list (s5, LIN 22/026) — if not, this is voluntary-but-built-to-the-same-standard, not strictly mandatory. Doesn't change the build either way.
- **ACSC Severity scoping:** ACSC Severity (C1–C6) applies to this notification pathway only — not to OAIC/NDB or Ransomware Payment tasks. Field lives on the parent Cyber Incident (single source of truth) and is dot-walked into this task for reference. See Subsystem C for mandatory gate timing.

### B.5 NDB — Assessment (Privacy Act 1988, s26WH) and Notification (ss26WK/26WL)

This pathway splits into two independent mechanisms, not "two SLAs on one task" as in the earlier draft — they live on different records and don't share a lifecycle.

**Assess Suspect Data Breach — Cyber Incident–level SLA**
- **Trigger:** always attached, starts from `Date/Time Became Aware` on the parent Cyber Incident — independent of whether a Regulatory Notification Task ever gets created.
- **SLA:** 30 calendar days — a genuine statutory ceiling under s26WH, not an internal target. Safe to present as a deadline.
- **Stop condition:** `Eligible Data Breach Determination` is set, either outcome (Eligible / Not Eligible – Remediated / Not Eligible – Low Risk).
- **Why it lives here and not on a task:** an incident assessed as Not Eligible never spawns a Regulatory Notification Task at all — anchoring the SLA to a task that may never exist doesn't work. The Cyber Incident record is the only thing guaranteed to exist from the moment awareness is recorded.

**Notify OAIC and affected individuals — Regulatory Notification Task**
- **Trigger:** created when `Eligible Data Breach Determination = Eligible`.
- **Eligibility test (human-assessed via Approval, not auto-calculated):** unauthorised access/disclosure/loss of personal information + likely serious harm + remediation didn't eliminate the risk.
- **SLA name:** **OAIC/affected-party notification target** — 72 hours, internal guardrail only. ss26WK/26WL impose no fixed timeframe in law ("as soon as practicable"), so this is deliberately named a *target*, never a *deadline*.
- **Stop condition:** any Closed state (per B.3's equivalence rule).
- **Recipients:** OAIC (formal NDB statement) + affected individuals (direct preferred, published notice if impractical).
- **Regulator confirmed:** OAIC/Privacy Act 1988 (Cth) — private-sector entity, NSW IPC/MNDB scheme does not apply.
- **Cross-regime note:** can fire simultaneously with B.4 — same `Private Information` fact, two regulators, two independent clocks. Expected, not a conflict.

**Date/Time Became Aware:** mandatory at insert on the Cyber Incident, but left **empty** by default — see Field Register §6.1 and Architecture Decisions §19 for the rationale.

### B.6 Ransomware/Cyber Extortion Payment Reporting (Cyber Security Act 2024, Part 3)

- **Trigger:** `Ransom/Extortion Payment Made` = true
- **4-part legal test:** incident occurred/occurring/imminent + impact (direct or indirect) on the entity + an extorting entity made a demand + the entity (or a third party on its behalf) provided a payment/benefit related to that demand
- **SLA:** 72 hours from `Payment Date/Time` — or from when the org becomes aware a third party (insurer, lawyer) paid on its behalf, if applicable. **This is a separate clock from Date/Time Became Aware.**
- **Recipients:** ASD + Department of Home Affairs, via ReportCyber portal
- **Scope confirmation:** your org qualifies as a "reporting business entity" via the SOCI-regulated critical infrastructure basis, independent of annual turnover.
- **Note:** paying a ransom is not illegal in Australia — this is a reporting-after-the-fact obligation, not a permission gate. The decision to pay sits outside this design (connects to Executive Escalation, Subsystem C).
- **Close Code:** deliberately **not** adding a "Ransom Paid" value. The fact is already captured by the boolean. Close Code describes disposition (how the incident ended); payment is an independent event that can co-occur with any disposition (e.g. Threat Neutralised + payment made are both simultaneously true).

### B.7 SOI Internal Routing — PARKED

Not built this session. Confirmed scope only:
- Visibility-only via a team/group, not a named approver or Approval record — same shape as MIM's Watcher role
- No independent external reporting obligation — already fully covered by the Data Classification escalation floor in B.1
- Open: which specific group; whether it needs its own Regulatory Notification Task entry or just a Watch list addition

### B.8 Executive Escalation / MIM Engagement — Process Rule, Not a Build

Deliberately **not** a ServiceNow mechanism — your standalone MIM process owns this. Documented trigger for that process, derived from the same Confirmed SOCI Classification field used everywhere else (no separate/duplicate check):

| Confirmed SOCI Classification | MIM Engagement |
|---|---|
| Significant | Full MIM invocation |
| Relevant | MIM notify/standby |
| No Report | No MIM trigger |

- `Persistent Threat = true` does **not** independently escalate MIM engagement — it rides entirely on SOCI classification like everything else.
- **Out-of-band comms trigger (definition only, mechanism designed in a separate dedicated session):** `Persistent Threat = true` AND `Confirmed SOCI Classification = Significant` (i.e., MIM is engaged).

### B.9 FIRB Data and Security Conditions — PARKED

Not designed this session — could not be verified against public sources. FIRB conditions are bespoke per company, attached to your specific No Objection Notification, not published law. **Action required outside ServiceNow:** legal/compliance team to retrieve the actual conditions document. If a genuine notification obligation is confirmed, it slots into Regulatory Notification Task as an additional Notification Type with minimal extra work — the table is already generic enough.

---

## Subsystem C — Impact / Urgency / Priority (Revised)

> **Note:** This subsystem was substantially redesigned after the initial architecture review. The previous design phase-gated Urgency and left Priority blank pre-Recovery. That design is retired — see Architecture Decisions §10 and §15 for the revised rationale.

- `Impact` = native `task.impact`, relabeled I1–I4. Visible and **mandatory from Investigation & Diagnosis onward**. No phase-gating.
- `Urgency` = native `task.urgency`. Visible and **mandatory from Investigation & Diagnosis onward**. No phase-gating, no hiding via UI Policy at any stage.
  - Urgency is a single field with a single label throughout the incident lifecycle. Its meaning naturally shifts — early phases: urgency to contain and stop spread; Recovery: urgency to restore service. No label change needed; urgency is a measure of speed/time regardless of phase.
- `Priority` = native, calculated from Impact × Urgency. **Active from Investigation & Diagnosis onward** — no longer blank pre-Recovery. MIM process fires cleanly off P1/P2 from this point. Priority is also the trigger for MIM engagement in the standalone MIM process — see B.8.
- **Priority is never downgraded once correctly assessed.** A correctly assessed P1 or P2 stays that way for reporting integrity. Teams can slow their response behaviourally without changing the record. The historical accuracy of the Priority record matters more than real-time adjustment.

### C.1 ACSC Severity — mandatory gate (revised)

ACSC Severity is no longer mandatory at Investigation & Diagnosis as a blanket rule. It becomes mandatory on the parent Cyber Incident form **only when `Suggested SOCI Classification ≠ No Report`** — enforced via UI Policy with that condition.

**Rationale:** ACSC Severity describes actual current incident state (e.g. C1 = "sustained disruption to essential systems") — it cannot be accurately assessed before the scope of the incident is known. Making it mandatory early forces a speculative assessment that may never be revisited. It becomes assessable and relevant at the point a SOCI notification obligation is identified, which is exactly when Suggested SOCI Classification moves off "No Report."

**Field location:** parent Cyber Incident (single source of truth). Dot-walked into the ASD/SOCI Regulatory Notification Task for reference and Legal review. Applies to ASD/SOCI notification pathway only — not present on OAIC/NDB or Ransomware Payment tasks.

**Notification task creation dependency:** the ASD/SOCI Regulatory Notification Task is not created until the parent record saves successfully with ACSC Severity set. This ensures the task is created complete. See B.3 for the full creation trigger and duplicate guard.

### C.2 Impact floor — soft prompt by Data Classification

When `Data Classification of Affected Assets` is set or changed and `Impact` is below the floor for that classification, a warning message fires recommending reassessment. Analyst can override — this is a prompt, not a hard block.

| Data Classification contains | Impact floor |
|---|---|
| Private Information | No lower than I2 |
| Sensitive Operational Information | No lower than I2 |
| Critical Infrastructure Information | No lower than I1 |

**Mechanism:** onChange Client Script on Data Classification field, checks current Impact value against floor, fires `g_form.addInfoMessage()` or `g_form.addWarningMessage()` if below floor. Does not prevent save.

### C.3 Dashboard implications

Sort/filter the Cyber Incident dashboard by Priority from Investigation & Diagnosis onward — Priority is now meaningful throughout the incident lifecycle. ACSC Severity remains available for cyber-domain trending and ASD reporting context but is not a primary dashboard sort field.

---

## Subsystem D — State Model

### D.1 Mandatory field gating (confirmed via existing build screenshots — documented here for completeness)

| State | Newly-mandatory |
|---|---|
| Investigation & Diagnosis | Impact, Urgency, Assigned to |
| When Suggested SOCI Classification ≠ No Report | ACSC Incident Severity (conditional — see Subsystem C.1) |
| Containment | Classification tab (Threat category, Threat actor classification, Attack vector, MITRE ATT&CK tactic, Data classification of affected assets) |
| Eradication | Containment tab (Containment method, Containment notes) |
| On Hold | On hold reason |
| Closed | Resolution tab (ACSC Essential Eight control gap, Close code, Close notes) |

**False Positive exemption:** `Close Code = False Positive` waives the entire Classification + Containment tab mandate. Legally consistent, not just a UI convenience — no genuine incident occurred, so the downstream SOCI/NDB/ransomware chains were never going to trigger either.

### D.2 Full State Transition Matrix

| From | Allowed To |
|---|---|
| New | Investigation & Diagnosis; Closed *(False Positive only)* |
| Investigation & Diagnosis | Containment; On Hold; Closed *(False Positive only)* |
| Containment | Eradication; Investigation & Diagnosis; On Hold; Closed *(False Positive only)* |
| Eradication | Recovery; Containment; Investigation & Diagnosis; On Hold |
| Recovery | Closed; Eradication; Containment; Investigation & Diagnosis; On Hold |
| On Hold | Investigation & Diagnosis; Containment; Eradication; Recovery; Closed *(False Positive only)* |
| Closed | *(none — terminal state)* |

**Key decisions baked into this matrix:**
- **No skip-ahead transitions.** Every incident passes through Investigation & Diagnosis before Containment, even for obviously severe cases — ensures Severity/Assigned to are always set before containment action begins.
- **Multi-step backward regression is allowed** (e.g. Recovery → Investigation & Diagnosis directly), not limited to one step back.
- **Eradication → Closed is blocked, including for late-discovered False Positives.** Real containment actions were already taken against real systems by this point; a brief Recovery check-in to confirm those systems are genuinely fine is required before closing.
- **New → On Hold is blocked.** None of the existing On Hold reasons (Awaiting forensics/law enforcement/vendor/ASD response) make sense before any work has started.

**Build note:** the False-Positive-only transitions are **conditional**, not pure state pairs — valid only when `Close Code = False Positive` at the moment of transition. A plain From/To lookup table cannot express this alone; the enforcing Business Rule (or an extra condition column on the matrix table) needs a second check for these specific rows.

### D.3 Insert-time constraint — new records must be created into New only

- **Zero exceptions, including historical data migration.** If migration is ever genuinely needed, that should be an explicit, logged, elevated-permission exception at that specific point in time — not a standing gap in this rule.
- **Mechanism:** a dictionary default of "New" is insufficient on its own — it only applies when the field is left blank, not when something explicitly sets a different value on insert. Enforce via a **Before Insert Business Rule (or ACL)** that actively rejects/corrects any insert where `State` ≠ New.
- **Why this matters beyond the obvious:** the future monitoring-system integration (Subsystem B's "Became Aware" design referenced this) would create tickets via API, not a human filling out a form. Without this rule, a misconfigured integration — or a bad Import Set mapping — could insert records directly into Containment or Closed, bypassing the entire gated lifecycle, mandatory field progression, and audit trail this whole design depends on.

### D.4 Closure validation

Block transition **to** Closed while any linked Regulatory Notification Task is in an active (non-Closed/non-Cancelled) state. Prevents the parent incident closing while a live 12hr/72hr/30-day regulatory clock is still running on a child task.

---

## Subsystem E — Record Integrity / Closure Lock

- **State lock:** Closed is terminal (Subsystem D.2) — no outbound transitions defined.
- **Field lock:** a **write ACL** on the Cyber Incident table — `current.state == closed` → deny write on all fields. This must be enforced at the ACL/data layer, not just UI Policy. UI Policy alone is form-level only and does nothing against a REST API call, background script, or Data Import — for a record that may underpin regulatory reporting, the data-layer mechanism is the one that actually matters.
- **Exception:** `Work notes` remains appendable on a Closed record — a journal field is append-only by nature (each entry is its own immutable, timestamped, attributed record), so allowing new entries doesn't compromise the integrity of what's already there.
- UI Policy can still grey out fields for a clean form UX, but the ACL is the real enforcement — both should be built, not one in place of the other.

---

## Subsystem F — Choice List Corrections

See Field Register §3 for the full detail. Summary of *changes only*:

- ACSC Essential Eight control gap: 2 value corrections (Application control; Configure Microsoft Office macro settings)
- Threat category, Threat actor classification, Attack vector, Containment method, Close code, On hold reason: **no changes** — verified and confirmed correct as-is, or confirmed as deliberately non-standardisable.

---

## Subsystem G — Multi-Select Choice List Conversion

Five fields convert from single-select Choice to multi-select this session: Threat category, Attack vector, Data classification of affected assets, Containment method, ACSC Essential Eight control gap.

### G.1 Mechanism (applies to all five)

Convert to ServiceNow's native **List** field type — checkbox-rendered, comma-separated value storage. **Not** a custom many-to-many junction table. None of these fields require per-selection metadata (e.g. no requirement to timestamp *when* each individual containment method was applied) — a junction table would be unused complexity for a problem a native field type already solves.

Choice values are unchanged for four of the five fields — only the selection mechanism changes. Reporting note: ServiceNow's native report builder supports "contains" filtering and grouping on Multiple Choice fields natively — no rework needed for the Threat Category trending or Essential Eight heat-map dashboard work already planned for Lab 10.

### G.2 Data Classification of Affected Assets — logic rework (not just a UI change)

This field feeds live calculated logic elsewhere in the app (Subsystem B), so converting it to multi-select requires more than a field-type change:

- **SOCI escalation floor (§B.1):** currently checks "if Data Classification = X." Must become "if Data Classification **contains** X," evaluated across all selected values, taking the highest-priority match where more than one applies.
- **OAIC/NDB trigger (§B.5):** same equality-to-contains rework, specifically for the Private Information check.
- **New validation rule:** "None Identified" must be mutually exclusive with every other value on this field. Enforce via Client Script/onChange validation — a record cannot simultaneously claim no classification applies and that Private/SOI/Critical Infrastructure Information was affected.
- **Why this is a real fix, not a nice-to-have:** an incident touching both Private Information and Critical Infrastructure Information simultaneously (e.g. a utility metering/account data breach) is a normal scenario, not an edge case. The single-select version of this field was silently incapable of representing that — this conversion corrects an actual gap in the classification logic, not just the form UX.

---

## Subsystem H — UI Actions for State Progression

State transitions are controlled via **UI Action buttons**, not direct State field editing. This matches the pattern used in ServiceNow's own modern ITSM modules (Incident, Problem, Change) and is a stronger design than a free-edit dropdown for several reasons: each button carries its own validation logic; available buttons change by state so analysts only see valid transitions; and it maps directly to the state transition matrix in Subsystem D.

### H.1 Forward progression buttons

One button per valid next state, visible only when that transition is valid from the current state:

| Current State | Button Label |
|---|---|
| New | Begin Investigation |
| Investigation & Diagnosis | Move to Containment |
| Containment | Move to Eradication |
| Eradication | Move to Recovery |
| Recovery | Close Incident |

### H.2 Special transition buttons

- **Return to Containment** — visible from Eradication, Recovery, and On Hold (where pre-hold state was Eradication or Recovery). Triggers a confirmation dialog before firing: *"This will return the incident to Containment — containment actions will need to be reassessed. Are you sure?"* This is the "we didn't clean it up properly" regression path.
- **Close as False Positive** — separate button from the standard Close, visible from New, Investigation & Diagnosis, Containment, and On Hold. Carries the False Positive exemption logic (waives Classification + Containment tab mandates). Keeps the False Positive path explicit and distinct from a normal closure.
- **On Hold** — visible from Investigation & Diagnosis, Containment, Eradication, Recovery. Stores the current state in a hidden field (`pre_hold_state`) before transitioning — used by Resume to return to the correct state.
- **Resume** — visible when State = On Hold. Returns to the state stored in `pre_hold_state`.

### H.3 Build notes

- Each button's server-side script sets `current.state` and calls `current.update()` — same pattern as any other UI Action that modifies a field.
- Mandatory field validation for the target state should fire in the button's Condition field or script before the transition — analyst sees the validation message without the state actually changing.
- The False Positive conditional transitions from D.2 are enforced in the "Close as False Positive" button's condition/script, not in the standard Close button — keeping the two paths structurally separate.
- Built in Lab 28 (Client scripts and UI actions).