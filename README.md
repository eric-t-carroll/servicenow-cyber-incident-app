# ServiceNow Cyber Incident Custom Application

This custom application has been created to provide hands experience, reinforcing the ServiceNow Certified System Administration (CSA) and Certified Application Developer (CAD) courses. I am starting this project after completing my CSA and am just starting CAD course content.


## Project context
ServiceNow PDI with Zurich patch 6 (build: glide-zurich-07-01-2025__patch6-01-16-2026).
Lab content is based on CSA and CAD certifications.
Update sets and data exports are exported as XML and committed per lab.
   - Post lab06: adding in daily 1 hour code-challenges, where code functionality contributes to the project.
      - Aim is to improve my JavaScript ability while studying CAD.
      - Script files will be synced as .js files alongside the update set XMLs going forward.


## Key features/decisions
 - Custom Cyber Incident Application extending the 'task' table.
    - Decision made not to extend the 'incident' table so records are kept separate from default incident lists and views (security requirement).
    - Also keeps core tables safe from customisation and risk of incompatibility with future versions.
 - Australian Cyber Security Centre (ACSC) aligned fields
 - 'Persistent threat' flag triggers out-of-band communications procedures
 - Phase gated form sections align to the cyber incident lifecycle
    - Investigation & diagnosis
    - Containment
    - Eradication
    - Recovery
 - Application access is initially restricted to MIM and security team roles
    - Access requests managed via IT portal
 - Cyber incident playbook added (CAD phase)


## AI assisted development
Project build is done with the assistance of Claude (Anthropic) as a technical coach and lab guide.
 - Overall concepts for the project are provided me me.
 - Architectural decisions are made based on a discussion with Claude about good practice.
 - Claude provided step-by-step lab instructions, design recommendations, and answered technical questions throughout the build.
 - All decisions, configuration, and code were reviewed and implemented by me.
 - Claude is operating in an advisory capacity.
 - Guidance was accepted, rejected, or modified based on my own experience as a process lead, judgement and testing.

Coding challenges are supported by Claude acting as a tutor/coach.
 - Claude guides toward solutions through questions and hints rather than providing direct answers, only sharing code when explicitly requested. 
 - All code is written, tested and understood by me before being committed.


## Technical references
- Scope name: cyber_0
- Full scope prefix: x_1776078_cyber_0
- Cyber Incident table: x_1776078_cyber_0_cyber_incident
- Number prefix: CYB (starting at CYB1000001)
- Parent table: task

## Repository structure
```
servicenow-cyber-incident-app/
├── data-exports/                   # XML exports with user and group data
├── update-sets/
│   ├── csa-labs/                   # Update set XML from CSA labs and coding challenges
│   └── cad-labs/                   # Update set XML from CAD labs and coding challenges
└── README.md
```

## Branching strategy
| Branch | Purpose |
|--------|---------|
| `main` | Stable, completed work only. Merged into at the end of each completed lab. |
| `csa-labs` | Active branch for CSA phase labs (Labs 01-15) and related coding challenges. |
| `cad-labs` | Active branch for CAD phase labs (Labs 16-35) and related coding challenges. To be created when Lab 14 begins. |

- All work is done in the phase branch and merged into `main` on lab completion.
- Coding challenge `.js` files are committed to the active phase branch under `code-challenges/`.
- Once the VSCode ServiceNow extension is configured, script files will be synced directly from the PDI into the active phase branch.

## Work indexes
### Lab index
| Lab | Name | Phase | Status |
|-----|------|-------|--------|
| 01 | PDI activation, GitHub repo and update set workflow | CSA | Completed |
| 02 | Scoped app creation and task table extension | CSA | Completed |
| 03 | ACSC-aligned custom fields and persistent threat flag | CSA | Completed |
| 04 | Custom form layout and views | CSA | Completed |
| 05 | State model & UI Policies | CSA | Completed |
| 06 | ACLs — restrict access to MIM and security roles | CSA | Completed |
| 07 | IT portal access request form and approval workflow | CSA | Completed |
| 08 | Notifications and persistent threat out-of-band alert | CSA | Completed |
| 09 | Form hygiene, inbound email actions and 'time to triage' SLA | CSA | Completed |
| 10 | Reports and Cyber Incident dashboard | CSA | Completed |
| 11 | CMDB basics and linking affected CIs to incidents | CSA | Completed |
| 12 | Import sets, transform maps and data sources | CSA | Completed |
| 13 | Apply field register changes after design review | CSA | Completed |
| 14 | Multiple choice conversion | CSA | Completed |
| 15 | Scripted REST API - expose Cyber Incident endpoint | CSA | Completed |
| 16 | Business rule — Data Classification contains checks | CAD | Completed |
| 17 | Regulatory Notification Task table | CAD | Completed |
| 18 | SOCI classification matrix-lookup | CAD | Completed |
| 19a | Suggested/Confirmed approval pattern | CAD | Completed |
| 19b | Legal approval for REG task | CAD | Completed |
| 20 | ASD/SOCI notification trigger | CAD | Completed |
| 21 | OAIC/NDB notification trigger | CAD | Completed |
| 22a | Ransomware payment reporting trigger | CAD | Completed |
| 22b | Application Properties — configurable SLA targets | CAD | Completed |
| 22b1 | Lab25b1 - ACL clean up and lock down REG when closed | CAD | Completed |
| 23 | SOCI warning/info banner | CAD | Completed |
| 24 | State transition matrix — design and enforcement | CAD | Completed |
| 25a | Closure validation + Record Integrity ACL | CAD | Completed |
| 25b | REG task SLA definitions | CAD | In Progress |
| 25c | Scheduled Job — Notification SLA Status rollup sweep | CAD | Planned |
| 26 | Urgency/Priority phase-gating | CAD | Planned |
| 27 | Resolved / Resolved By — mandatory & auto-populate at Closure | CAD | Planned |
| 28a | State transition UI Actions | CAD | Planned |
| 28b | Special transition UI Actions | CAD | Planned |
| 28c | REG task approval guard rails | CAD | Planned |
| 28d | UI Polish | CAD | Planned |
| 29 | Flow Designer — automated lifecycle workflow | CAD | Planned |
| 30 | Script Includes & GlideRecord API (general CAD coverage) | CAD | Planned |
| 31 | Playbook Designer — standard response playbook | CAD | Planned |
| 32 | Playbook Designer — persistent threat branch | CAD | Planned |
| 33 | ATF — automated testing | CAD | Planned |
| 34a | IntegrationHub — outbound notification spoke | CAD | Planned |
| 34b | Delegated Development walkthrough (role-play) | CAD | Planned |
| 35 | App Engine Studio polish | CAD | Planned |


### Code-challenges index
| Challenge | Name | Status |
|-----------|------|--------|
| 01 | Containment Notes are mandatory at save (replaced by UI Policy) | Deprecated |
| 02 | Auto assign new CYB tickets | Complete |
| 03 | UI Action, escalate to persistent threat | Complete |
| 04 | Object construction from a categorical input | Planned |
| 05 | Parameter handling/validation on a multi-field input | Planned |
| 06 | Array.indexOf()/.includes() against a multi-select field value | Planned |
| 07 | Building a 2D lookup and querying it | Planned |
| 08 | Error message patterns, reading a g_scratchpad value set by a Display Business Rule | Planned |


## Daily workflow overview
### Project Build Sessions
1. Apply Remote Changes in browser Studio before starting any session
   - Browser Studio → Source Control → Apply Remote Changes
2. Check active branch
   - Labs 01-15 → csa-labs
   - Labs 16-35 → cad-labs
3. Do lab work in ServiceNow PDI as normal
4. Export Update Set to VSCode folder
5. Update README lab index
6. git add . → git commit -m → git push
7. Merge to `main` when lab is fully complete
 - git checkout main → git merge csa-labs → git push → git checkout csa-labs
8. Commit application changes via ServiceNow Studio source control
   - Browser Studio → Source Control → Commit Changes → confirm push to portfolio repo
   - Merge dev branch to main via GitHub Pull Request (Compare & pull request)

### Coding Challenge Sessions
1. Check active branch in terminal
2. Make script changes in ServiceNow PDI
3. Export Update Set to VSCode folder
4. Update README coding challenges index
5. git add . → git commit -m → git push


## Project restore instructions
1. Retrieve and commit update sets up to and including LAB06.
2. Import the Lab06 Groups XML export file (Right-click Import XML on 'groups' list view). Then manually re-assign roles and groups for Major Incident Management and Cyber Security groups.

To restore code challenges:
 - Retrieve and commit all update sets in order as per your existing restore instructions

### Reference standards
- [ACSC — Australian Cyber Security Centre](https://www.cyber.gov.au)
- [ACSC Essential Eight](https://www.cyber.gov.au/resources-business-and-government/essential-cyber-security/essential-eight)
- [ServiceNow Zurich release notes](https://docs.servicenow.com)


### Future work
**CAD-phase scripting/architecture**
- SLA rebuild: Investigate / Contain & Eradicate / Recover stages, scripted single-SLA-per-stage pattern
- Configurable SLA duration parameters (admin-adjustable)
- Child tasks generated for notifications (ASD/Private Info/Critical Infrastructure)
- Persistent threat mode: continuous top-of-form banner and suppress other standard notifications once active.
- Dedicated Containment tab (Containment Method + Notes only), properly hidden by state.
- Cyber incident response playbook (Lab 22)
- Problem record auto-creation on incident closure
- Change advisory gate between containment and eradication phases
- Post-incident review table extending task
- GlideRecord utility Script Include for common queries
- IntegrationHub spoke for ASD notification (SOCI Act)
- Severity-based MIM call-out info message (High/Critical severity)
- After programmatic clearValue/setValue(''), re-selecting "Regulated/Essential Services" as the first choice
   doesn't register. Flagged for review in polish pass.


**Form/field hygiene**
- Strip Ref:MSG watermark string from inbound email reply text before writing to work_notes
- HTML email styling refinement / content wording review once real outbound email tested

**Process/governance**
- State transition matrix — comprehensive rules for valid state changes across full lifecycle,
  Closed = permanent read-only lock, On Hold return-state behaviour
- Improve catalog item/flow (e.g. ticket updates when group auto-assign completes)

**Other**
- Business Impact Assessment application
- PDI outbound email setup (real SMTP, inbox testing)


### Ideas for after the Cyber Incident Application
Standalone applications / major builds
 - BIA (Business Impact Assessment) application
      - standalone application/table. Tasks for technical teams to populate impacted services during a large scale event. Eventually would link into teams to present the tasks.
      - Possible future link: recovery/regulatory SLA complexity could eventually pull in BIA data and breached-data-type to dynamically adjust SLA targets.
 - IntegrationHub spoke for ASD/SOCI Act — formal integration build, not a simple script

Cross-application extensions
 - Problem record auto-creation on closure
 - Change advisory gate between containment and eradication - enable easy change management
 - Post-incident review table — extending task, separate review processes


## Notable learnings
 - 1/6: Initially extended the Incident table. Decided to start again with task table extension, so CYB records did not appear in the Incident lists and views.
  - 5/6: Testing recovery of the application via 'release instance and retrieve all update sets' found Lab02 - Scoped application did not capture creation of the application scope.
      - This is by design.
      - I have to manually publish an application to update set, from the application record after creating it - 'application record > publish to update set'.
   - 5/6: Full restore up to Lab06 successful. After importing groups XML you still need to reassign the roles and group members.
   - 6/6: VSCode has been configured with the ServiceNow Extension for VSCode and my custom application has been synced.
      - Had to install JSNode to resolve npm install issue
      - Cyber Incident Management/ folder contains PDI-synced app files
         - Do not manually edit files in this folder — always edit in ServiceNow and sync down
      - Always sync FROM ServiceNow into VSCode
         - Never edit the .js files directly in VSCode and expect them to push back to ServiceNow.
         - The sync is one direction: PDI → VSCode → GitHub.
 - 9/6: created a script version of 'auto-assign new tickets to Cyber Security' and then disabled it, for code practice. Then created a version using 'actions' which is left enabled (best practice). Both are captured in the update set.
 - 16/6: created a portfolio repo and linked the application to source control via ServiceNow Studio. The first commit created multiple 'historical' commits in my repo. ServiceNow then detected those as a discrepancy with my local version. Had to stash the changes I was working on and pull the historical commits before I could commit the new Lab update. ServiceNow also created a 'stash' local update set, even though I had already completed my update set and exported it. Found the 2 updates sets to be identical when examining the contents in VS Code. Has worked without issue since puling down the historical commits.
 - 18/6: Working through the process of analysing business process and creating design documents would reduce development friction. I'm basically making design decisions on the fly based on my previous work experience.
 - 18/6: Reports are captured in update sets, dashboards are not. Need to 'unload dashboard' to make sure it is captured in the same update set as the reports.
 - 21/6: Decided to create a proper design spec instead of 'winging it'. A lot of decisions were being made on the fly and I could see a lot of rework coming because of it. It was also a good oportunity to make sure the design aligned with ACSC specifications and other regulatory requirements.
 - 9/7: **Priority/Urgency phase-gating retired:** original design hid Urgency pre-Recovery and left Priority blank. Revised — both mandatory from Investigation & Diagnosis onward. Priority drives MIM engagement (P1/P2); a blank Priority in early phases meant MIM had no signal. Correctly assessed Priority is never downgraded — reporting integrity > real-time accuracy.
 - **Scripted REST External Default ACL:** controls endpoint access for authenticated callers; separate from table-level ACLs that control what the caller can do once through the gate.
 - 29/7: Field Messages must be set before clearing or setting values on an onChange script. Otherwise the field message is cleared on the value change.
 - 2/8: Full restore via source control and individual update sets completed successfully.
 - 6/8: Approval tasks need 'sysapproval' field set along with 'document_id' - otherwise they don't appear in related approval lists.
 - 8/8: UI Actions use the 'onClick' field to call a function. The function is defined in the script field. gsftSubmit saves the form and triggers server-side script.
 - 9/8: Field level and wildcard access controls can get messy if you don't think about it properly before putting them in.
  - 25/8: SLA engine appears to run SLA creation scripts twice. Caused 'notificationDueTime' to be calculated in a way similar to +=, each time adding the SLA days onto itself. Fixed by creating a new GlideDateTime so notificationDueTime was a clone of the paymentTime's value, not a direct reference to it.
 - 25/8: Users need the ITIL role otherwise they can't edit fields inherited from task. NExt time I would likely create the CYB table completely from scratch as there weren't that many inherited fields I ended up using.