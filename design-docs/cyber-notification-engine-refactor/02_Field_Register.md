# Cyber Incident Management — Field Register
## Comprehensive Data Dictionary (Full Source of Truth)

> **How to read this document:** every field on the form is listed, organized by tab/section, in form order. Each entry is flagged:
> - **EXISTING** — already built, unchanged this session
> - **MODIFIED** — already built, behaviour or values changed this session
> - **NEW** — added this session
>
> Existing fields are validated against build screenshots (Cyber Incident form, states New through Closed, plus choice list dropdowns) taken during this session. Where a field is referenced in design work but wasn't independently visible in a screenshot (noted explicitly below), confidence is flagged accordingly.

---

## 1. Header fields

| Field | Status | Type | Notes |
|---|---|---|---|
| Number | EXISTING | String, auto-numbered | CYB prefix, starts CYB1000001 |
| Caller | EXISTING | Reference (sys_user) | Person who reported/raised the alert — not inherited from `task`, added manually (Lab 03) |
| Configuration item | EXISTING | Reference (cmdb_ci) | Native `task` field — single primary CI |
| Persistent threat | EXISTING | Boolean | Triggers alternative out-of-band playbook branch when ticked (Lab 03 / playbook Lab 22a — mechanism design parked for its own session) |
| Notification required to ASD | MODIFIED (behaviour) | Boolean | Field itself unchanged. **Auto-tick rule replaced this session** — see §6.3, Regulatory Notification Task. Old rule ("Severity = Critical") retired. |
| Short description | EXISTING | String | Native `task` field, mandatory |
| Description | EXISTING | Text | Native `task` field |
| State | MODIFIED (transitions) | Choice | Values unchanged: New, Investigation & Diagnosis, Containment, Eradication, Recovery, On Hold, Closed. **Full transition matrix and insert-time constraint added this session** — see Refactor Specification §D. |
| ACSC Incident Severity | MODIFIED (values) | Choice | Was Critical/High/Medium/Low → now C1, C2, C3, C4, C6 (no C5). See §1.1 detail below. |
| Assignment group | EXISTING | Reference (sys_user_group) | Native `task` field |
| Assigned to | EXISTING | Reference (sys_user) | Native `task` field |
| On hold reason | EXISTING | Choice | Conditional, mandatory when State = On Hold. Values: Awaiting forensics, Awaiting law enforcement, Awaiting vendor, Awaiting ASD response |

### 1.1 ACSC Incident Severity — full detail (MODIFIED)

| Value | Label | Help text (self-assessment framing) |
|---|---|---|
| C1 | C1 — Sustained Disruption | Select when there is sustained disruption to essential systems and the services they support. |
| C2 | C2 — Extensive Compromise | Select when compromise is broad across systems, accounts, or data, but essential services are not yet experiencing sustained disruption. |
| C3 | C3 — Isolated/Coordinated Compromise | Select when compromise is contained to a limited number of systems, or a deliberate, coordinated attack is underway without broader compromise. |
| C4 | C4 — Low-Level Attack | Select for a low-level malicious attack with limited scope and no confirmed compromise. |
| C6 | C6 — Unsuccessful Attack | Select when an attack was attempted but unsuccessful — no compromise occurred. |

C5 deliberately excluded — never resolves for the Regulated Critical Infrastructure column of the ACSC Incident Categorisation Matrix (Appendix K). Mechanism: `sys_choice` record edit only, no field/schema change.

---

## 2. Notes tab

| Field | Status | Type | Notes |
|---|---|---|---|
| Watch list | EXISTING | List (native `task`) | New use this session, not a new field — MIM added here as a Watcher on Regulatory Notification Tasks |
| Work notes list | EXISTING | List (native) | |
| Work notes | MODIFIED (behaviour) | Journal (native) | Remains appendable even when the record is Closed — the one exception to the closure write-lock (§7) |
| Activities | EXISTING | Read-only audit log (native) | |

---

## 3. Classification tab

| Field | Status | Type | Notes |
|---|---|---|---|
| Threat category | MODIFIED (multi-select) | **Multiple Choice** (was single Choice) | See §3.1 |
| Threat actor classification | EXISTING | Choice (single-select, confirmed) | Nation-state, Cybercriminal, Hacktivist, Insider, Unknown — verified against industry threat-actor taxonomy, no changes |
| Attack vector | MODIFIED (multi-select) | **Multiple Choice** (was single Choice) | See §3.1 |
| MITRE ATT&CK tactic | EXISTING | String, free text | |
| Data classification of affected assets | MODIFIED (multi-select + logic rework) | **Multiple Choice** (was single Choice) | See §3.2 — **requires logic rework, not just a UI change** |
| Affected Asset Type | NEW | Choice | Regulated/Essential-Service Impacted, Corporate-Only Impacted. Mandatory at Containment. Go-live: manual. Future release: CMDB-suggested. |

### 3.1 Multi-select conversions — mechanism

**Threat category, Attack vector, Containment method (§4), Essential Eight Control Gap (§5):** convert to ServiceNow's native **Multiple Choice** field type (checkbox-rendered, comma-separated value storage). No custom many-to-many table — none of these fields need per-selection metadata (e.g. no requirement to timestamp *when* each individual containment method was applied), so a junction table would be unused complexity.

Choice values for each field are **unchanged** — only the field type/selection behaviour changes. See existing value lists in §3 (Threat category, Attack vector), §4 (Containment method), §5 (Essential Eight).

**Reporting note for Lab 10:** ServiceNow reports natively support "contains" filtering and grouping on Multiple Choice fields — no rework needed for the Threat Category trending or Essential Eight heat-map dashboard work already planned.

### 3.2 Data Classification of Affected Assets — multi-select with logic rework (MODIFIED)

| Value | Status |
|---|---|
| Sensitive operational information | unchanged |
| Private information | unchanged |
| Critical infrastructure information | unchanged |
| None Identified | unchanged value, **new validation rule** |

**Logic rework required (not optional, not cosmetic):**
- The SOCI escalation floor (Refactor Specification §B.1) currently checks "if Data Classification = X." With multi-select, this must become "if Data Classification **contains** X," evaluated across all selected values, taking the highest-priority match if more than one applies.
- The OAIC/NDB trigger (§B.5) similarly checks for Private Information specifically — must use a contains-check, not equality.
- **New validation rule:** "None Identified" must be mutually exclusive with every other value on this field — a record cannot simultaneously claim no classification applies and that Private/SOI/Critical Infrastructure Information was affected. Enforce via Client Script or onChange validation preventing "None Identified" from being selected alongside any other value (and vice versa).
- **Realistic scenario this fixes, not just a theoretical one:** an incident touching both Private Information and Critical Infrastructure Information simultaneously is a normal case (e.g. a utility's metering/account data breach), not an edge case — the single-select version of this field was silently incapable of representing that.

---

## 4. Containment tab

| Field | Status | Type | Notes |
|---|---|---|---|
| Containment method | MODIFIED (multi-select) | **Multiple Choice** (was single Choice) | Network isolation, Account disable, System shutdown, Patch applied, Firewall rule, Third-party engagement, Other — values unchanged, mechanism per §3.1 |
| Containment notes | EXISTING | Text | |

---

## 5. Resolution tab

| Field | Status | Type | Notes |
|---|---|---|---|
| ACSC Essential Eight control gap | MODIFIED (2 values corrected + multi-select) | **Multiple Choice** (was single Choice) | See §5.1 |
| Close code | EXISTING | Choice (single-select, confirmed) | Threat neutralised, False positive, Handed to law enforcement, Resolved by vendor, Unresolved. **Deliberately not adding a "Ransom Paid" value** — already captured independently by `Ransom/Extortion Payment Made` (§6.1) |
| Close notes | EXISTING | Text | |
| Resolved | EXISTING | Date/Time | **Future work (not built):** currently non-mandatory even at Closed. Flagged for mandating/auto-populating at closure. |
| Resolved by | EXISTING | Reference (sys_user) | Same future-work flag as Resolved |

### 5.1 ACSC Essential Eight control gap — full detail (MODIFIED)

| Old value | Corrected value | Status |
|---|---|---|
| Application whitelisting | **Application control** | Corrected — "whitelisting" is ACSC's retired term |
| Disabling macros | **Configure Microsoft Office macro settings** | Corrected — official strategy covers signed/trusted-location macro config, not just a binary disable |
| Application patching | Application patching | Unchanged (paraphrase of official "Patch applications" — optional tighten) |
| OS patching | OS patching | Unchanged (paraphrase of official "Patch operating systems" — optional tighten) |
| Multi-factor authentication | Multi-factor authentication | Unchanged — exact match to official term |
| Restricting admin privileges | Restricting admin privileges | Unchanged (paraphrase — optional tighten) |
| Hardening user applications | Hardening user applications | Unchanged (paraphrase — optional tighten) |
| Backups | Backups | Unchanged (paraphrase of official "Regular backups" — optional tighten) |
| Undetermined | Undetermined | Unchanged — fallback value |

Plus multi-select conversion per §3.1.

---

## 6. New fields and table this session

### 6.1 New fields on Cyber Incident

| Field | Type | Values/Notes |
|---|---|---|
| Suggested SOCI Classification | Choice, read-only/calculated | No Report, Relevant, Significant — `MAX(lookup(Impact, Affected Asset Type), data_classification_floor)` |
| Date/Time Became Aware | Date/Time | Drives SOCI + NDB clocks. Not `sys_created_on`. **Mandatory at insert, left empty by default** — forces an explicit choice between "now" and a backdated time; never auto-populated from Acknowledged Time. |
| Awareness Basis | Text | Documents reasoning for the awareness time selected |
| Acknowledged Time | Date/Time | When someone with the ability to recognise a cyber incident actually reviewed/confirmed it |
| Ransom/Extortion Demand Received | Boolean | Tracked independently of payment |
| Ransom/Extortion Payment Made | Boolean | Triggers Regulatory Notification Task (Cyber Security Act – Ransomware Payment Report) |
| Payment Date/Time | Date/Time | Independent clock from Became Aware — starts 72hr ransomware reporting SLA |
| Eligible Data Breach Determination | Choice | Pending Assessment, Eligible, Not Eligible – Remediated, Not Eligible – Low Risk |
| Notification SLA Status | Choice, rollup | No Active Notifications, On Track, At Risk, Breached — drives persistent warning banner |

**New SLA Definition (Cyber Incident table): "Assess Suspect Data Breach"** — 30-day SLA, starts `Date/Time Became Aware`, stops when `Eligible Data Breach Determination` is set. Lives on the Cyber Incident record, not the Regulatory Notification Task — see Refactor Specification §B.5.

### 6.2 Modified field — Confirmed by Legal/Compliance

Upgraded from a simple checkbox to a proper **Approval record** (`sysapproval_approver`) on the linked Regulatory Notification Task, assigned to Legal — reuses the Lab 07 approval pattern, gives a real audit trail.

### 6.3 New table — Regulatory Notification Task

**Table name (suggested):** `x_1776078_cyber_0_regulatory_notification_task`, extends `task`. Shared mechanism across all notification pathways (ASD/SOCI, OAIC/NDB, Ransomware Payment Report; SOI parked for future release).

| Field | Type | Notes |
|---|---|---|
| Parent Cyber Incident | Reference | |
| Notification Type | Choice | ASD/SOCI Notification, **Notify OAIC and affected individuals** (renamed from OAIC/NDB Notification), SOI Internal Routing *(parked)*, Cyber Security Act – Ransomware Payment Report |
| SOCI Classification | Choice | Copied at insert from parent's Suggested SOCI Classification. Legal + Cyber Admin write only. Drives SLA attach/cancel — see §B.3. |
| Assignment group | Reference | Defaults to Cyber Security |
| Priority | Choice | Drives SLA target, editable/downgradable by Cyber Security |
| State | Choice | Standard task states + Cancelled + 3 Closed-type values (**Closed Complete**, **Closed No Longer Required**, **Rejected** — `Closed Incomplete` removed, see Open Items Register). SOCI-only value **"Oral Notification Complete"** added, filtered per Notification Type via Dependent Choice List; Business Rule/ACL enforces server-side (not form-only). |

`Notification required to ASD` (boolean, §1) auto-tick rule: = true when Suggested SOCI Classification ∈ {Significant, Relevant}.

**Note:** the 30-day NDB Assessment SLA ("Assess Suspect Data Breach") is not a field on this table — it lives on the Cyber Incident record. See §6.1.

**New SLA Definition (Regulatory Notification Task table): "ASD/SOCI Initial Notification – Significant"** — 12hr SLA, starts `Date/Time Became Aware`, stops on `Oral Notification Complete` OR either Closed state. Start Condition: `Notification Type = ASD/SOCI Notification AND SOCI Classification = Significant`. See Refactor Specification §B.4.

**New SLA Definition (Regulatory Notification Task table): "ASD/SOCI Initial Notification – Relevant"** — 72hr SLA, starts `Date/Time Became Aware`, stops on `Oral Notification Complete` OR either Closed state. Start Condition: `Notification Type = ASD/SOCI Notification AND SOCI Classification = Relevant`. See Refactor Specification §B.4.

**New SLA Definition (Regulatory Notification Task table): "ASD/SOCI Written Follow-up – Significant"** — 84hr SLA, starts at the `Oral Notification Complete` state-change timestamp, stops on either Closed state. Start Condition: `Notification Type = ASD/SOCI Notification AND SOCI Classification = Significant AND State = Oral Notification Complete`. See Refactor Specification §B.4.

**New SLA Definition (Regulatory Notification Task table): "ASD/SOCI Written Follow-up – Relevant"** — 48hr SLA, starts at the `Oral Notification Complete` state-change timestamp, stops on either Closed state. Start Condition: `Notification Type = ASD/SOCI Notification AND SOCI Classification = Relevant AND State = Oral Notification Complete`. See Refactor Specification §B.4.

**New SLA Definition (Regulatory Notification Task table): "OAIC/Affected-Party Notification Target"** — 72hr internal target (non-legal), starts `Date/Time Became Aware` (task creation), stops on either Closed state. Start Condition: `Notification Type = Notify OAIC and affected individuals`. See Refactor Specification §B.5.

---

## 7. Reused native fields (existing, behaviour modified this session)

| Field | Status | Notes |
|---|---|---|
| Impact (`task.impact`) | REUSED, relabeled | I1 — Full outage, I2 — Widespread degradation, I3 — Error, not preventing delivery of service, I4 — No impact/informational. Pure operational severity — does not encode asset type. |
| Urgency (`task.urgency`) | MODIFIED (behaviour) | Visible and mandatory from Investigation & Diagnosis onward — no phase-gating. Urgency measures speed/time regardless of phase; early phases: urgency to contain; Recovery: urgency to restore. Single field, single label throughout. |
| Priority (`task.priority`) | MODIFIED (behaviour) | Calculated natively from Impact × Urgency. Active from Investigation & Diagnosis onward — no longer blank pre-Recovery. Drives MIM engagement (P1/P2). Never downgraded once correctly assessed. |

---

## 8. Related lists and backend fields (existing)

| Item | Status | Notes |
|---|---|---|
| Task SLAs | EXISTING | Native `task_sla` related list |
| Impacted CIs | EXISTING | Downstream/auto-derived CI relationships — used (alongside Affected CIs) to inform the Regulated/Essential-Service determination |
| Affected CIs | EXISTING | Directly/manually linked CIs — same use as above |
| Cyber Incident Phase | EXISTING (Lab 05) | Derived from State; values Investigation & Diagnosis, Containment, Eradication, Recovery. Previously drove Urgency phase-gating UI Policy — that policy has been retired as of 25 July 2026 redesign. **Confidence note:** not independently visible as a standalone form field in screenshots — referenced throughout this session's design work as an existing operative field per the original build documentation (Lab 05). Worth a quick visual confirmation in the PDI, not a re-build. |

---

## 9. Cosmetic/UI items (existing, not fields, noted for completeness)

- **Buttons:** Update, Escalate to Persitent threat *(typo — missing "s," low priority, fix whenever convenient)*, Delete
- **Related Links:** Escalate to Persitent threat *(same typo)*, Show SLA Timeline, Repair SLAs

---

## 10. Deferred to future work (not built this session)

| Item | Status |
|---|---|
| `Resolved`, `Resolved by` mandatory/auto-populate at Closure | Future work, not built |
| CMDB-driven Affected Asset Type | Future release — see Architecture Decisions document |
| SOI Internal Routing as a Regulatory Notification Task type | Parked — group/mechanism undecided |
