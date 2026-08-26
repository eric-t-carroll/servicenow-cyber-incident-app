# Cyber Incident Management — Architecture Decisions & Talking Points

> **Purpose:** This document captures the reasoning behind the non-obvious design decisions from this session — the "why," not the "what." Use this as interview prep and portfolio material: each section is framed as a decision, an alternative that was considered and rejected, and the reasoning that tipped it.

---

## 1. Why C1–C6 instead of Critical/High/Medium/Low

The original field used a generic four-value severity scale. The redesign adopted ACSC's actual operational categorisation matrix (C1–C6) instead — not as a renaming exercise, but because ASD revised that matrix in March 2022 specifically to prioritise Critical Infrastructure and Systems of National Significance reporting. Adopting C1–C6 isn't cosmetic alignment; it's using the same scale ASD will use when this organisation actually reports to them.

**The detail that makes this defensible, not just directionally correct:** the matrix was traced precisely for the Regulated Critical Infrastructure significance column, and it turns out **C5 never resolves for that column** — every Cyber Effect row lands on C4 or jumps straight to C6. The choice list deliberately excludes C5 rather than including all six values for completeness. Including a category that can never legitimately apply isn't neutral — it gives analysts a value to mis-select and corrupts the data. This is the kind of detail that signals genuine engagement with the source material rather than pattern-matching "six severity levels, ship it."

---

## 2. Why the ACSC severity field stays separate from the legal SOCI/NDB determination

It would have been simpler to derive the 12hr/72hr SOCI reporting trigger directly from ACSC severity (e.g. "C1–C3 = report"). This was explicitly rejected after walking through real counter-examples: C2 ("extensive compromise") can be a pure confidentiality event with zero availability impact — which fails the Significant Impact test (an availability-only legal test) even though it sounds severe. C3 collapses two different cyber effects (isolated compromise vs. coordinated-but-unconfirmed attack) onto one category, which have different legal outcomes.

**The principle:** ACSC's C1–C6 measures *extent and intent of the cyber effect* — a real, useful operational triage signal. SOCI's significant/relevant impact tests measure something narrower and specifically legal — actual or imminent impact on availability/integrity/reliability/confidentiality of a regulated asset. The two are correlated, not identical. Collapsing one into the other looks fine until a real incident doesn't fit the pattern — and by then it's reporting under the wrong deadline. The two systems were kept deliberately separate, each doing one job.

---

## 3. Why a generic, configurable severity matrix was rejected for ACSC significance

Early in the design, a fully general two-axis model (Cyber Effect × Significance, configurable like the real ACSC matrix) was considered — letting any organisation type determine its own column. This was deliberately walked back. The Significance axis (which column of the matrix applies) is **invariant** for this application — it will only ever run at one organisation, and that organisation's classification doesn't change incident to incident. Building a real second axis for a value that never varies is solving a problem that doesn't exist.

**The test applied, worth reusing elsewhere:** does this axis actually vary independently, incident to incident? If yes, build it as a real input. If no, pre-resolve it at design time and bake it into the field definition instead. Recognising when *not* to add configurability is as much a sign of design judgement as recognising when to add it.

---

## 4. The matrix-lookup pattern, applied five times deliberately

This session's single most-repeated architectural decision: replace hardcoded conditional logic with a data-driven lookup table validated by a Business Rule. It shows up as:

1. The (rejected, but instructive) Cyber Effect × Significance matrix
2. Impact × Affected Asset Type → SOCI classification
3. The State Transition Matrix
4. ServiceNow's own native Priority Lookup Rules (Impact × Urgency → Priority) — recognised as the precedent that justified pattern #2, not coincidentally similar to it
5. The documentation structure itself — config/logic kept separate from sequencing, mirroring the same separation-of-concerns principle applied to the app

**The interview-ready framing:** "I recognised ACSC's severity model as a two-axis lookup matrix — the same pattern ServiceNow already uses natively for Priority calculation — so I built the equivalent logic the same way instead of writing nested if/else conditions. I applied that same pattern consistently across the app wherever two genuinely independent inputs needed to combine into an outcome, including reusing it for the design documentation itself."

---

## 5. Why "Affected Asset Type" is a flat field at go-live, not a CMDB integration

The full version of this feature — deriving asset criticality from the CMDB's Affected CIs and Impacted CIs relationships — was scoped and **deliberately deferred**, not because it's not the right long-term answer, but because building it before the CMDB relationship data exists and is trustworthy would mean building on sand. A flat, analyst-set field ships a working, legally-sound notification engine immediately.

**The detail that matters for the interview answer:** the go-live field and the future CMDB-derived version were designed to present **the same value to the same downstream logic** — the Impact × Asset Type lookup, the SOCI suggested-classification calculation, and the warning-banner trigger never need to change when the CMDB integration lands later. Only *how the field gets populated* changes. This is a deliberate stable-interface decision: build to an interface now, swap the implementation underneath it later, without anything downstream needing to be touched. It's the difference between a "future release" and a future rebuild.

---

## 6. The Suggested/Confirmed pattern — a human gate, applied consistently

Every regulatory determination in this design — SOCI classification, NDB eligibility, the ransomware payment trigger — follows the same shape: the system calculates a *suggested* outcome from objective inputs, and a person (via an Approval record, not a checkbox) must confirm it before anything fires. This wasn't designed once and copied; it was arrived at independently for SOCI, then deliberately reused for NDB rather than inventing a second mechanism.

**Why this matters, stated plainly:** "likely serious harm," "materially disrupted," and similar legal tests are genuinely judgement calls — sensitivity of data, realistic risk of misuse, whether containment actually eliminated the risk. A system that silently auto-fires a 12-hour statutory notification based on a calculated field is making a legal determination without a lawyer in the loop. The suggested/confirmed split keeps the system fast (the suggestion is instant) without making it the final authority.

---

## 7. Why Legal got an Approval record, not a new checkbox mechanism

The original "Confirmed by Legal/Compliance" design was a simple boolean. It was upgraded specifically because this application already has a working Approval pattern from Lab 07 (the IT portal access request workflow) — reusing it for Legal's sign-off here is more consistent than introducing a second, lighter-weight confirmation mechanism, and it produces a real audit trail (who approved, when, what they noted) instead of a tickbox anyone with form access could check. For a field gating a statutory notification, that audit trail isn't optional polish — it's the difference between a defensible process and an unverifiable one.

---

## 8. Why MIM gets a Watcher, not an Approval

Legal and MIM are both "internal stakeholders on a notification task," but they were deliberately given different mechanisms once their actual roles were examined: Legal validates *whether* a notification is required and at what level — that's a decision, so it gets an Approval. MIM needs *visibility* that a serious incident is in flight, not a sign-off role — so it gets the task's native `Watch list` field instead. Same underlying mechanism (a `task` table feature), applied differently because the actual job differs. Defaulting both to the same treatment "for consistency" would have been the wrong kind of consistency.

---

## 9. Why Executive Escalation has no ServiceNow build at all

The most counter-intuitive finding in this session: "Critical Infrastructure → executive escalation" turned out not to need a database field, a Flow, or a task. Executive engagement is governed entirely by the organisation's existing standalone Major Incident Management process — ServiceNow's job is to make the trigger condition unambiguous (Confirmed SOCI Classification = Significant → full MIM invocation), and the existing persistent warning banner already surfaces that condition. The actual escalation action belongs to the MIM runbook, not a ServiceNow task.

**Worth stating directly in an interview:** not every requirement in a design needs a system build. Recognising that a requirement is fully satisfied by *existing* infrastructure plus documentation is a legitimate, defensible outcome — and arguably a stronger one than building a redundant mechanism just because the requirement sounded like it needed one.

---

## 10. Why Impact and Urgency are set early, and why Priority is never downgraded

The original design phase-gated Urgency — hiding it through Investigation, Containment, and Eradication, and leaving Priority blank until Recovery. That design was revisited and reversed after working through real operational concerns.

**The case for setting Impact and Urgency early:** Priority is what triggers the Major Incident Management process (P1/P2 = MIM engagement). If Priority is blank for the first half of the incident's life, the MIM process has no signal to fire against — a critical gap for a regulated entity where MIM engagement may itself be a process obligation. A rough-but-timely Priority is more operationally useful than a precise-but-delayed one. Teams can always revise their assessment as the incident develops.

**The reframing of Urgency:** the original concern was that "urgency to restore" is dangerous in the early phases — rushing recovery before proper containment/eradication can destroy forensic evidence or tip off an attacker. That concern was valid, but the conclusion drawn from it (hide Urgency) was wrong. Urgency doesn't disappear in the early phases — it just points at a different question. "How urgently do we need to contain and stop spread" is a real, assessable question from minute one. The label doesn't need to change; urgency is a measure of speed/time regardless of what the speed is being applied to.

**Why Priority is never downgraded once correctly set:** a correctly assessed P1 stays P1 for reporting and audit purposes. If the incident turns out to be less severe than initially assessed, the correct response is to document that in Work Notes, not to revise the Priority record retroactively. The historical accuracy of the Priority record — what was known, when, and what response it triggered — is more important than keeping Priority current as the incident evolves. Teams can slow their response behaviourally without touching the record.

**The soft prompt design for Impact floor:** rather than hard-blocking low Impact values when sensitive data is involved, a warning fires when Data Classification contains Private Information, Sensitive Operational Information, or Critical Infrastructure Information and Impact is below the corresponding floor. The analyst can override — the system flags the inconsistency without overriding the analyst's judgement. This is the same suggested/confirmed philosophy applied in Subsystem B: the system surfaces information, a person decides.

---

## 11. Why a write ACL, not just a UI Policy, locks the Closed state

"Make a Closed record uneditable" could have been satisfied with UI Policy alone (grey out the fields). That was explicitly rejected as insufficient: UI Policy is form-level enforcement only — it does nothing against a REST API call, a background script, or a Data Import overwriting a closed record's fields. Given these records may underpin actual regulatory reports, "looks locked in the UI" and "is actually locked" are different claims, and only the second one matters for audit defensibility. The real mechanism is a write ACL at the data layer; UI Policy is kept as well, purely for a clean user experience, not as the enforcement mechanism itself.

---

## 12. Why "new records must be created into New" has zero exceptions

This rule was deliberately built with no migration carve-out, even though legitimate historical data migration is a real scenario this app may eventually face. The reasoning: a standing exception in the rule is a permanent gap, while a one-off historical migration is better handled as an explicit, logged, elevated-permission action taken at that specific moment — visible in the audit trail as exactly what it was, rather than baked into the rule as a quiet, permanent bypass.

**Why this rule matters more than it looks like it should:** a future monitoring-system integration (flagged but not yet built) would create incidents via API, not a person filling out a form. Without a hard insert-time constraint, a misconfigured integration or a bad Import Set mapping could insert records directly into Containment or even Closed — silently bypassing every mandatory-field gate, every classification step, and the entire audit trail this design depends on. This single rule is what makes the rest of the state model actually mean something, for every record, not just the ones that happen to follow the rules.

---

## 13. Choice lists: verified, not assumed — and what was deliberately left out

Several choice lists were checked against primary sources (ACSC's Essential Eight page, ACSC's Types of Threats page, a standard threat-actor taxonomy) rather than assumed correct because they'd been in the build for several labs. Two genuine errors were found and corrected (Essential Eight terminology had drifted to deprecated ACSC language). Equally important: several plausible additions (Account compromise, Terrorist Group, several consumer-facing ACSC threat categories) were considered and explicitly declined, on the grounds that adding values "for completeness" that would never realistically get selected is the same kind of bloat this design avoided everywhere else — an unused C5, a redundant Close Code value, an unnecessary configurable Significance axis. A choice list audit isn't just "did we miss anything" — it's equally "did we only add what earns its place."

---

## 14. Why native Multiple Choice, not a junction table, for the multi-select conversions

Five choice fields converted from single-select to multi-select this session. The alternative considered was a proper many-to-many junction table (Cyber Incident ↔ each selected choice value as its own related record), which is the more "enterprise" pattern and would allow per-selection metadata — e.g. tracking exactly when each individual containment method was applied, or notes specific to one selected threat category.

That capability was deliberately not built, because none of these five fields have a real requirement for per-value metadata today. A junction table is the right tool when you need to query, report on, or annotate each selected value independently; here, the actual requirement is simply "more than one value can be true at once" — which ServiceNow's native List field type satisfies directly, with no custom table, no new relationships to maintain, and full native support in reporting (contains-filtering, grouping) for the Lab 10 dashboard work already planned. This is the same test applied in decision #3 (the rejected configurable Significance axis): build the flexibility that's actually needed, not the flexibility that sounds more sophisticated.

**One field broke that simplicity, and it's worth being explicit about why:** Data Classification of Affected Assets isn't just a multi-select UI change — it feeds live calculated logic (the SOCI escalation floor, the NDB trigger), both of which previously assumed exactly one value could be true. Converting it required rewriting that logic from equality checks to contains-checks across all selected values, plus a new mutual-exclusivity rule for "None Identified" against every other value. The distinction worth carrying into the interview answer: not every multi-select conversion is purely cosmetic — when a field is also a calculation *input*, widening its cardinality can silently break the logic built on top of it unless that logic is explicitly revisited, not just the form.

---

## 15. Why the Urgency/Priority design was eventually revised, not defended

Early in the design, a proposal surfaced arguing that cyber incidents need a fundamentally different prioritisation model than standard ITIL Impact × Urgency — citing premature restoration risk and the fact that a compromised endpoint with sensitive data can matter more than an offline internal service. The initial response was to defend the existing phase-gating design as already addressing those concerns via the three-field split (ACSC Severity + SOCI Classification + phase-gated Priority).

That defence was subsequently revisited and found to be incomplete. The real operational gap it missed: **Priority is what triggers MIM engagement**, and a blank Priority in the early phases means MIM has no system signal to fire against. Defending the phase-gating design was prioritising theoretical correctness ("urgency to restore shouldn't be assessed yet") over operational reality ("P1/P2 needs to exist so the right people are engaged immediately").

The revised design keeps the three-field split intact — ACSC Severity still does its cyber-domain characterisation job, SOCI Classification still does its regulatory job, and Priority still does its MIM-triggering and operational triage job — but removes the phase-gating that was making Priority useless for the first half of every incident's life.

**The judgement call worth naming directly:** when a design defence requires arguing that a blank field is "intentional and correct," that's a signal worth examining carefully. In this case, the blank Priority was genuinely harming the operational usefulness of the application.

---

## 16. Why the SOCI initial SLA uses an OR stop condition, not a single fixed path

The initial 12hr/72hr SLA was designed to stop on **either** `State = Oral Notification Complete` **or** any Closed state, whichever happens first — not on a single fixed sequence. The reasoning: the statutory obligation is satisfied by written notification alone, with no oral step required. Modelling the SLA as a strict oral-then-written sequence would have created a false dependency — a task where written notification was submitted first (satisfying the deadline) would have looked "incomplete" against a model that expected oral first.

**The follow-up is conditional, not universal:** the 84hr/48hr written follow-up SLA only starts if `Oral Notification Complete` was actually reached before the initial deadline. If written notification was the first and only channel used, the follow-up obligation never legally existed — so no follow-up SLA is created. Building it as an always-on second clock would have manufactured a deadline that doesn't exist in the Act.

---

## 17. Why oral/written completion is state-driven, not a tickbox + date field

The earlier design used `Oral notification made` and `Written notification submitted` as boolean + date/reference-number fields. Both were cut in favour of a shared `State` value (`Oral Notification Complete`) plus Closed-state completion.

**The reasoning connects directly to decision #11 (write ACL over UI Policy):** a boolean field can be ticked and its accompanying date backdated by anyone with edit access, with nothing in the system distinguishing "this actually happened at this time" from "someone set this field to look that way." A Stop Condition tied to a genuine `State` transition is a different kind of fact — it's the timestamp of a real, audit-logged record change, not a value someone typed into a field. For records that may underpin a regulatory notification, that distinction is the same "looks done vs. is provably done" argument used for the Closed-state write lock — applied here to task completion instead of field editability.

---

## 18. Why NDB Assessment lives on the Cyber Incident record, not the Notification task

The 30-day assessment clock (s26WH) was originally modelled as one of two SLAs on the Regulatory Notification Task. That was revised once a real scenario was worked through: an incident assessed as **Not Eligible** never spawns a Notification task at all — there's nothing to notify. A clock that's supposed to run for every incident from the moment awareness is recorded can't live on a record that might never exist.

Anchoring `Assess Suspect Data Breach` to the Cyber Incident itself means the clock always starts, regardless of the eventual outcome — the Notification task (and its own `OAIC/affected-party notification target` SLA) only comes into existence downstream, once Eligible is actually confirmed.

---

## 19. Why Date/Time Became Aware is mandatory but empty at insert, not defaulted

The same pattern from decision #12 (the State=New insert-time rule with zero exceptions) was applied here: the field is required at insert, but deliberately **not** auto-populated from `Acknowledged Time` or `sys_created_on`. A silent default is a value nobody actually looked at — it satisfies "the field is filled in" without satisfying "someone made a considered legal judgement about when this organisation first became aware."

Making the field mandatory-but-blank forces that judgement to happen explicitly at the point of creation — accept the current time, or actively backdate to when awareness genuinely occurred. The mechanism differs from decision #12 (a Before Insert Business Rule enforcing `State = New` vs. a mandatory dictionary attribute with no default), but the underlying principle — don't let a system timestamp quietly stand in for a decision that has legal weight — is the same one.

---

## 20. Naming convention — "target" vs "deadline," backed by statute

Every SLA name in the NDB pathway was deliberately chosen to match what the underlying law actually requires, not just company convenience:

- **Assess Suspect Data Breach** — 30 days, framed and named as a real ceiling, because s26WH imposes an actual statutory limit on the assessment step.
- **OAIC/affected-party notification target** — 72 hours, deliberately never called a "deadline," because ss26WK/26WL impose **no fixed timeframe** — "as soon as practicable" is uncapped in law. Naming this a deadline would misstate the obligation to anyone reading the SLA record later without the surrounding context — including a future auditor, a new team member, or a regulator asking why a "deadline" was missed when no such deadline exists.

This mirrors the same discipline decision #5 (Ransomware Payment) and B.5 already apply elsewhere in this design: an internal guardrail must be labelled as one, every time, everywhere it appears.

---

## 21. Why three 'Closed States' become two

'Closed Incomplete' was removed from 'state' options. A notification task is either completed or no longer required. 'Closed Incomplete' gave a REG task owner the option of just never completing the notification for no good reason.

---

## 22. REG does not need a state transition matrix

Decision made that REG state transition does not need enforcement. REG are open when created, can move freely between open states and are locked down when moved to closed.

---

## 23. Why SOCI written notification SLA is always calculated from Oral Notification Complete

The actual legal mechanism is that the written follow-up is always due 84 hours after the oral report was given. There is no hard cap based on Date/Time Became Aware. If the Oral Notification is early or late, the written follow up is still required based on when the initial notification was done.

---

## 24. Why was ACSC's rating decoupled from the SOCI Classification classification trigger

ACSC's rating is externally assigned and may not even exist yet at report time. It is also not an input into calculating the SOCI Classification (Relevant/Significant).

---

## 25. Why REG task carries it's own SOCI Classification

SOCI Classification is stored on the REG task (copied from CYB at insert) ionstead of (a) a live dot-walk to the parent, or (b) a separate "Confirmed" field alongside "Suggested":
 - this keeps an audit trail, showing the point in time decision legal made about the SOCI Classifciation - recorded by LEgal updating the SOCI Classification on the reg task. This keeps the original value on the CYB untouched.
 - It simplifies the SLA mechanism. SLA can be calculated off a single field on the REG task, instead of having to refer to the SOCI CLassification on CYB record for the initial SLA creation, but then dynamically updating when the SOCI Classification is updated on the REG task by Legal.

 ---

 ## 26. Rejected as a state on REG

 Rejected state is used to confirm when Legal do not agree with the values input into the SOCI CLassification matrix. In this case Legal reject the REG task with a note to update the CYB record. The analyst updates the CYB record with correct values and recreates the SOCI notification task, which is calculated from teh date/time became aware field - meaning it still has correct breach times.

