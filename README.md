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
├── Cyber Incident Management/      ← VSCode extension sync, do not edit manually
│   └── src/
├── data-exports/                   # XML exports with user and group data
├── code-challenges                 # temporary location for work in progress .js files
├── update-sets/
│   ├── csa-labs/                   # Update set XML and .js from CSA labs and coding challenges
│   └── cad-labs/                   # Update set XML and .js from CAD labs and coding challenges
└── README.md
```

## Branching strategy
| Branch | Purpose |
|--------|---------|
| `main` | Stable, completed work only. Merged into at the end of each completed lab. |
| `csa-labs` | Active branch for CSA phase labs (Labs 01-13) and related coding challenges. |
| `cad-labs` | Active branch for CAD phase labs (Labs 14-21) and related coding challenges. To be created when Lab 14 begins. |

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
| 05 | State model — investigation, containment, eradication, recovery | CSA | Completed |
| 05 | UI policies — phase fields visible only in correct state | CSA | Completed |
| 06 | ACLs — restrict access to MIM and security roles | CSA | Completed |
| 07 | IT portal access request form and approval workflow | CSA | Completed |
| 08 | Notifications and persistent threat out-of-band alert | CSA | Planned |
| 09 | Inbound email actions and SLA definitions | CSA | Planned |
| 10 | Reports and Cyber Incident dashboard | CSA | Planned |
| 11 | CMDB basics and linking affected CIs to incidents | CSA | Planned |
| 12 | Import sets, transform maps and data sources | CSA | Planned |
| 13 | Scripted REST API — expose Cyber Incident endpoint | CSA | Planned |
| 14 | Business rules — server-side automation | CAD | Planned |
| 15 | Client scripts and UI actions | CAD | Planned |
| 16 | Flow Designer — automated lifecycle workflow | CAD | Planned |
| 17 | Script includes and GlideRecord API | CAD | Planned |
| 18 | Playbook Designer — Cyber Incident response playbook | CAD | Planned |
| 19 | ATF — automated testing for the app | CAD | Planned |
| 20 | IntegrationHub — outbound notification spoke | CAD | Planned |
| 21 | App Engine Studio polish | CAD | Planned |


### Code-challenges index
| Challenge | Name | Phase | Status |
|-----------|------|-------|--------|
| 01 | Containment Notes are mandatory at save | CSA | Complete |
| 02 | Auto assign new CYB tickets | CSA | Complete |
| 03 | UI Action, escalate to persistent threat | CSA | Complete |


## Daily workflow overview
### Project Build Sessions
1. Check active branch
   - Labs 01-13 → csa-labs
   - Labs 14-21 → cad-labs
2. Do lab work in ServiceNow PDI as normal
3. Export Update Set to VSCode folder
4. Sync Project in VSCode to pull script files down
5. Update README lab index
6. git add . → git commit -m → git push
7. Merge to `main` when lab is fully complete
 - git checkout main → git merge csa-labs → git push → git checkout csa-labs

### Coding Challenge Sessions
1. Check active branch in terminal
2. Make script changes in ServiceNow PDI
3. Sync File or Sync Project in VSCode to pull changes down
4. Update README coding challenges index
5. git add . → git commit -m → git push


## Project restore instructions
1. Retrieve and commit update sets up to and including LAB06.
2. Import the Lab06 Groups XML export file. Then manually re-assign roles and groups for Major Incident Management and Cyber Security groups.

To restore code challenges:
 - Retrieve and commit all update sets in order as per your existing restore instructions
 - After restore, sync the VSCode extension to confirm the files match

### Reference standards
- [ACSC — Australian Cyber Security Centre](https://www.cyber.gov.au)
- [ACSC Essential Eight](https://www.cyber.gov.au/resources-business-and-government/essential-cyber-security/essential-eight)
- [Protective Security Policy Framework (PSPF)](https://www.protectivesecurity.gov.au)
- [ServiceNow Zurich release notes](https://docs.servicenow.com)


### Future work
- Cyber incident response playbook (Lab 22, CAD phase)
- Problem record auto-creation on incident closure
- Change advisory gate between containment and eradication phases
- Post-incident review table extending task
- GlideRecord utility Script Include for common queries
- IntegrationHub spoke for ASD notification obligations under SOCI Act
- Business Impact Assessment application
   - standalone multi-table app for structured BIA during major incidents, designed to support optional Microsoft Teams Adaptive Card integration in a corporate instance.
- Improve UI on the CYB form (state flows, mandatory fields, visible fields etc)
- Improve the catalog item and flow. e.g. ticket gets updated when group auto assign completes etc.
 - Add containment_notes text field to the table and update client scripts to validate it
 - Fix Caller field reference qualifier — currently showing system roles not users
 - Fix record number prefix — showing TASK instead of CYB
 - Closed record lockdown — prevent state changes after closure

## Personal learnings
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