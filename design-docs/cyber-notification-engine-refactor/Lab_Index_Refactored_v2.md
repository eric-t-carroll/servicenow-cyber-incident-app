# Cyber Incident Management — Refactored Lab Index (v2 — resequenced)
## Post-Architecture-Review Sequence (supersedes prior CAD-phase index and the first refactor pass)

> **Status:** Labs 01–12 complete (CSA phase, `csa-labs` branch, unchanged — no rework needed). Field Register changes and the Multiple Choice conversion now happen **before** the Scripted REST API, so the API is built and tested against the real, current data model from day one rather than against retired severity values. Everything from Lab 13 onward is new, sequenced from the four architecture review documents (Refactor Specification, Field Register, Architecture Decisions, Open Items Register).
>
> **Branch:** `csa-labs` continues through Lab 15 (the REST API was always the planned last CSA-branch lab — it just now comes after two extra labs instead of zero). `cad-labs` created at Lab 16.
>
> **Source of truth:** the four architecture documents. This index is sequencing only — if this index and a design doc ever disagree, the design doc wins; flag it and we fix the index.

---

## Sequencing logic (why this order)

**Resequencing note (this version):** Field Register changes and the Multiple Choice conversion were pulled forward, ahead of the Scripted REST API, so the API's payload and validation logic can be built and tested against the real C1–C4/C6 severity values and the real multi-select fields from the start — rather than building against the old model and reworking it once the field changes land.

The remaining dependency chain is unchanged: **field/choice-list changes → multi-select conversion → REST API → new fields & table → matrix-lookup logic → state model → record integrity → notification triggers → SLAs → UI/UX polish (banners, dashboards) → Flow Designer → playbook.** Flow Designer and the Playbook both need a settled, enforced state model and a working notification engine underneath them, so they sit late. ATF and IntegrationHub sit after the thing they'd be testing/integrating actually exists.

**CAD blueprint gap-fill labs (22a, 26a, 35a):** checked against the official CAD exam blueprint's five domains (Application UI 20%, Security/Access 20%, Application Automation 20%, External Data 10%, Managing Applications 10%), the architecture-driven sequence left three named, examinable topics with no natural home — Application Properties, Scheduled Jobs, and Delegated Development. None of these were invented to pad the index; each was given a genuine, defensible build reason tied to something already in the design (configurable SLA targets, an SLA-status rollup backstop) or flagged honestly as pure exam literacy with no app-functional need (Delegated Development).

---

## CSA Phase (remainder) — `csa-labs` branch

| Lab | Title | Subsystem(s) | Update Set? | Notes |
|---|---|---|---|---|
| **13** | Apply Field Register changes — choice lists & new fields | F (choice corrections), Field Register §1.1, §6.1 | Yes | Foundational, mechanical: edit `sys_choice` for ACSC Incident Severity (C1–C4, C6, retire old values + update help text); correct the 2 Essential Eight values; add new fields (Suggested SOCI Classification, Date/Time Became Aware, Awareness Basis, Acknowledged Time, Ransom/Extortion Demand Received, Ransom/Extortion Payment Made, Payment Date/Time, Eligible Data Breach Determination, Notification SLA Status). No logic yet — just the data model catching up to the design. |
| **14** | Multiple Choice conversion — 5 fields | G | Yes | Convert Threat category, Attack vector, Data Classification of Affected Assets, Containment method, Essential Eight control gap to native Multiple Choice. Done now, ahead of the REST API, so the API's payload can correctly accept multi-select values from the start. |
| **15** | Scripted REST API — expose Cyber Incident endpoint | External Data domain | Yes | POST endpoint, MSSP-style payload, creates a Cyber Incident. Now built and testable against the **real**, current data model — C1–C4/C6 severity, multi-select Threat Category/Attack Vector/etc. — instead of the retired four-value severity scale. Response shape should not assume severity alone drives ASD notification (that logic doesn't exist yet — built properly in Lab 23). Last lab on `csa-labs`. **Code challenge tie-in:** CC-04 and CC-05 (see below) still precede this lab. |

---

## CAD Phase — `cad-labs` branch (created at Lab 16)

| Lab | Title | Subsystem(s) | Update Set? | Notes |
|---|---|---|---|---|
| **16** | Business rule — Data Classification contains-check rework | G (logic half) | Yes | The actual rework Architecture Decisions §14 flags: rewrite any existing equality-check logic against Data Classification to contains-checks, plus the new "None Identified" mutual-exclusivity validation (Client Script or onChange). First real CAD-phase scripting lab. **Code challenge before this lab: see CC-06 below.** |
| **17** | Regulatory Notification Task table | B.3, §6.3 | Yes | New table `x_1776078_cyber_0_regulatory_notification_task`, extends `task`. Build the table and fields only — no triggers yet. Confirms the shared mechanism before anything writes to it. |
| **18** | SOCI classification matrix-lookup | B.1, Architecture Decisions §4 | Yes | The headline Business Rule: Impact × Affected Asset Type lookup table + Data Classification escalation floor → `Suggested SOCI Classification`. This is the matrix-lookup-pattern Architecture Decisions calls out as the session's central technique. **Code challenge before this lab: see CC-07 below — the most important one to prep.** |
| **19** | Suggested/Confirmed approval pattern | B.1 (human gate), Architecture Decisions §6–7 | Yes | Reuse Lab 07's Approval pattern: upgrade "Confirmed by Legal/Compliance" from checkbox to a real `sysapproval_approver` record on the Regulatory Notification Task. |
| **20** | ASD/SOCI notification trigger | B.4 | Yes | Auto-create Regulatory Notification Task (Notification Type = ASD/SOCI) when Confirmed SOCI Classification ∈ {Significant, Relevant}. Retires the old "Severity = Critical" ASD auto-tick rule entirely. Assignment to Cyber Security, MIM added to Watch list. |
| **21** | OAIC/NDB notification trigger | B.5 | Yes | Auto-suggest on Data Classification contains Private Information. Two SLAs on one task (Assessment 30-day ceiling; internal 72hr notification target) — first multi-SLA-on-one-task build. |
| **22** | Ransomware payment reporting trigger | B.6 | Yes | Auto-create on `Ransom/Extortion Payment Made` = true. Independent 72hr clock from `Payment Date/Time`, separate from Date/Time Became Aware. |
| **22a** | Application Properties — configurable SLA targets | CAD blueprint gap-fill (Domain 4: Application Automation) | Yes | Replace any hardcoded SLA duration numbers from Labs 20–22 with `gs.getProperty()` reads against new Application Properties (e.g. `x_1776078_cyber_0.sla.asd_significant_hours`). The legitimate version of the "admin-configurable SLA" idea raised earlier — Application Properties is the correct ServiceNow mechanism for it, and it's also a directly CAD-blueprint-tested feature with no other natural home in this build. |
| **23** | Warning/info banner | B.2 | Yes | Display Business Rule (`when=display`) + `g_form.addWarningMessage()`/`addErrorMessage()`, driven by the single `Suggested/Confirmed SOCI Classification` field — not the individual inputs. **Code challenge before this lab: see CC-08 below.** |
| **24** | State transition matrix — design and enforcement | D.1–D.3 | Yes | Full matrix (Refactor Spec §D.2), conditional False-Positive-only transitions, hard insert-time constraint (Before Insert Business Rule/ACL — zero exceptions). |
| **25** | Closure validation + Record Integrity ACL | D.4, Subsystem E | Yes | Block Closed transition while any linked Regulatory Notification Task is active. Write ACL (`current.state == closed` → deny all) — data-layer lock, not UI-Policy-only. Work notes exception. |
| **25a** | Scheduled Job — Notification SLA Status rollup sweep | CAD blueprint gap-fill (Domain 4: Application Automation) | Yes | A Scheduled Script Execution that periodically recalculates `Notification SLA Status` (No Active Notifications/On Track/At Risk/Breached) across open Regulatory Notification Tasks — a genuine backstop in case the Display Business Rule (Lab 23) doesn't fire because nobody has the record open. The only Scheduled Job slot in this index — the blueprint names this explicitly and nothing else in the design calls for one. |
| **26** | Urgency/Priority phase-gating | Subsystem C | Yes | Hide native Urgency via UI Policy through Investigation/Containment/Eradication, mandatory at Recovery, value preserved on regression (no "clear value" action). Confirms native Priority stays blank pre-Recovery by design. |
| **27** | Resolved / Resolved By — mandatory & auto-populate at Closure | Field Register §10 (moved from future work) | Yes | Business Rule on transition to Closed: set `Resolved` (GlideDateTime) and `Resolved By` (current user) if not already populated; make both mandatory via the existing Closed-state UI Policy alongside the Resolution tab fields. Small, self-contained. |
| **28** | Client scripts and UI actions (general CAD coverage) | — | Yes | Original CSA/CAD-blueprint-coverage lab, retained from prior index — exam curriculum requires this regardless of app-specific need. |
| **28e** | End-to-end application testing (pre-Flow Designer), inserted before Lab 29. | — | Yes |  |
| **29** | Flow Designer — automated lifecycle workflow | — | Yes | Sequenced after the state model (Lab 24) and notification engine (Labs 20–22) both exist and are enforced — Flow has a real, settled contract to gate against. |
| **30** | Script Includes & GlideRecord API (general CAD coverage) | — | Yes | Curriculum-coverage lab, retained. By this point you'll already have written several real Script Includes via the code challenges below, so this lab can lean toward GlideRecord-query patterns specifically (the gap the challenges won't have covered). |
| **31** | Playbook Designer — standard response playbook | — | Yes | Still needs the settled state model first — unchanged position relative to prior plan. |
| **32** | Playbook Designer — persistent threat branch | — | Yes | Trigger condition now precisely defined (Open Items Register): `Persistent Threat = true AND Confirmed SOCI Classification = Significant`. Mechanism design still happens in its own dedicated session per your standing note — this lab builds it once that session has happened. |
| **32b** | End-to-end application testing (post-Playbooks), inserted before Lab 29. | — | Yes |  |
| **33** | ATF — automated testing | — | Yes | Now has real, complex logic worth testing (matrix lookups, multi-SLA tasks, the insert-time constraint) — more meaningful here than earlier in the sequence. |
| **34** | IntegrationHub — outbound notification spoke | — | Yes | ASD/SOCI Act spoke, as originally planned. |
| **34a** | Delegated Development walkthrough (role-play) | CAD blueprint gap-fill (Domain 6: Managing Applications) | No — config/admin only, no app-functional change | Standalone, hands-on: create a second dev user, enable Delegated Development on the app, assign yourself as the lead developer and the second user as a delegated developer. Make a small real change as the delegated developer (e.g. a label tweak), submit for review, then switch to your primary account to approve/reject it before it merges into the application's update set. No natural anchor in a solo-developer build, so this is explicit exam literacy rather than something the app needs. Good candidate to pair with a Git integration review (already in daily use) in the same session. |
| **35** | App Engine Studio polish | — | Yes | Final polish pass. |

---

## Feature enhancements — explicitly NOT lab-numbered (post go-live)

Per Open Items Register, marked as future work, not part of the build sequence above:

- CMDB-driven Affected Asset Type (replaces flat field — same downstream interface, per Architecture Decisions §5)
- SOI Internal Routing (group/mechanism undecided)
- FIRB Data and Security Conditions (blocked on legal document retrieval)
- Energy-sector-specific reporting obligations research (AEMO/AER/Energy Safe Victoria)
- SOCI (Application) Rules asset-class mandatory-status confirmation
- NDB statement content structured fields (Privacy Act s26WL)
- "Serious harm" assessment factors as a structured checklist (currently judgement-call text)
- Service/Business Criticality — check for native CSDM field before any future build
- BIA application, IntegrationHub spoke beyond ASD/SOCI, Problem record auto-creation, Change advisory gate, Post-incident review table, GlideRecord utility Script Include (general), Configurable SLA duration parameters, Persistent Threat notification-suppression logic — all previously logged, unchanged.

---

## Code Challenges — slotted inline, not rotated

Per your updated instruction: challenges appear only where they reinforce the immediately following lab, not on a fixed rotation. Each is still full Phase 1→2→3 coach mode.

| Code | Slot | Practices | Ties to |
|---|---|---|---|
| CC-04 *(restart pending)* | Before Lab 15 (REST API) | Object construction from a categorical input — `getSeverityProfile(severity)`. **Needs rescoping** once Lab 13's new severity values and Lab 17+'s SOCI-classification-driven MIM logic are clearer — the original Critical/High premise no longer applies. | Lab 15 REST response shape |
| CC-05 | Before Lab 15 | Parameter handling/validation on a multi-field input | Lab 15 REST request validation |
| CC-06 | Before Lab 16 | `Array.indexOf()`/`.includes()` against a multi-select (comma-separated) field value — the actual mechanical skill needed for contains-checks | Lab 16 contains-check rework |
| CC-07 | Before Lab 18 | **Most important prep challenge in this index.** Building a 2D lookup (object-of-objects or array-of-objects keyed two ways) and querying it — direct rehearsal of the matrix-lookup pattern before it's built for real with legal/regulatory stakes | Lab 18 SOCI matrix lookup |
| CC-08 | Before Lab 23 | `g_form.addWarningMessage()`/`addErrorMessage()` patterns, reading a `g_scratchpad` value set by a Display Business Rule | Lab 23 warning banner |

**Standing rule carried forward:** if a gap shows up mid-lab that isn't on this list (e.g. GlideRecord query patterns feel shaky going into Lab 17/30), we pause and run an undocumented bare-JS or Glide-API rep session on the spot — exactly like the earlier session's detour — rather than forcing through. I'll flag it proactively if I see it.

---

## Standing milestone (unchanged, position updated)

Full instance restore ×2 comparison (update sets vs. Studio source control) — still positioned at the CSA→CAD transition point, i.e. after Lab 15 (REST API), before Lab 16 (`cad-labs` branch creation).

## Standing reminder

This thread is approaching its image/context limit (95/100). Start a fresh chat thread now, with an updated handoff note, before beginning Lab 13.
