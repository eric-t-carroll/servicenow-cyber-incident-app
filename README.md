# ServiceNow Cyber Incident Custom Application

This custom application has been created to provide hands experience, reinforcing the ServiceNow Certified System Administration (CSA) and Certified Application Developer (CAD) courses. I am starting this project after completing my CSA and am just starting CAD course content.


## Project context
ServiceNow PDI with Zurich patch 6 (build: glide-zurich-07-01-2025__patch6-01-16-2026).
Lab content is based on CSA and CAD certifications.
Update sets and data exports are exported as XML and committed per lab.


## Key features/decisions
 - Custom Cyber Incident Application extending the 'task' table.
    - Decision made not to extend the 'incident' table so records are kept seperate from default incident lists and views (security requirement).
 - Australian Cyber Security Centre (ACSC) aligned fields
 - 'Perisitent threat' flag triggers out-of-band communications procedures
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
├── update-sets/
│   ├── csa-labs/          # Update set XMLs from CSA labs
│   └── cad-labs/          # Update set XMLs from CAD labs
└── README.md
```

### Lab index

| Lab | Name | Phase | Status |
|-----|------|-------|--------|
| 01 | PDI activation, GitHub repo and update set workflow | CSA | Complete |
| 02 | Scoped app creation and task table extension | CSA | Completed |
| 03 | ACSC-aligned custom fields and persistent threat flag | CSA | Completed |
| 04 | Custom form layout and views | CSA | Planned |
| 05 | State model — investigation, containment, eradication, recovery | CSA | Planned |
| 06 | UI policies — phase fields visible only in correct state | CSA | Planned |
| 07 | ACLs — restrict access to MIM and security roles | CSA | Planned |
| 08 | IT portal access request form and approval workflow | CSA | Planned |
| 09 | Notifications and persistent threat out-of-band alert | CSA | Planned |
| 10 | Inbound email actions and SLA definitions | CSA | Planned |
| 11 | Reports and Cyber Incident dashboard | CSA | Planned |
| 12 | CMDB basics and linking affected CIs to incidents | CSA | Planned |
| 13 | Import sets, transform maps and data sources | CSA | Planned |
| 14 | Scripted REST API — expose Cyber Incident endpoint | CSA | Planned |
| 15 | Business rules — server-side automation | CAD | Planned |
| 16 | Client scripts and UI actions | CAD | Planned |
| 17 | Flow Designer — automated lifecycle workflow | CAD | Planned |
| 18 | Script includes and GlideRecord API | CAD | Planned |
| 19 | Playbook Designer — Cyber Incident response playbook | CAD | Planned |
| 20 | ATF — automated testing for the app | CAD | Planned |
| 21 | IntegrationHub — outbound notification spoke | CAD | Planned |
| 22 | App Engine Studio polish and GitHub branching strategy | CAD | Planned |


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