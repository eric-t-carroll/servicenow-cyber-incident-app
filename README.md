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


## Technical references
- Scope name: cyber_0
- Full scope prefix: x_1776078_cyber_0
- Cyber Incident table: x_1776078_cyber_0_cyber_incident
- Number prefix: CYB (starting at CYB1000001)
- Parent table: task

## Repository structure
```
servicenow-cyber-incident-app/
├── data-exports/          # XML exports with user and group data
├── code-challenges        # temporary location for work in progress .js files
├── update-sets/
│   ├── csa-labs/          # Update set XML and .js from CSA labs and coding challenges
│   └── cad-labs/          # Update set XML and .js from CAD labs and coding challenges
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


## Code-challenges index
| Challenge | Name | Phase | Status |
|-----------|------|-------|--------|
| 01 | Containment Notes are mandatory at save | CSA | Completed |



## Restore instructions
 - Retrieve and commit update sets up to and including LAB06.
 - import the Lab06 Groups XML export file. Then manually re-assign roles and groups for Major Incident Management and Cyber Security groups.


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
- Business Impact Assessment application — standalone multi-table app for structured BIA during major incidents, designed to support optional Microsoft Teams Adaptive Card integration in a corporate instance.
 - Improve UI on the CYB form (state flows, mandatory fields, visible fields etc)
  - Improve the catalog item and flow. e.g. ticket gets updated when group auto assign completes etc.

## Personal learnings
 - Initially extended the Incident table. Decided to start again with task table extension, so CYB records did not appear in the Incident lists and views.
  - Testing recovery of the application via 'release instance and retrieve all update sets' found Lab02 - Scoped application did not capture creation of the application scope. Found this is by design. I have to manually publish an application to update set, from the application record after creating it - 'application record > publish to update set'.
   - Full restore up to Lab06 successful on the 5/6/2026. After importing groups XML you still need to reassign the roles and group members.