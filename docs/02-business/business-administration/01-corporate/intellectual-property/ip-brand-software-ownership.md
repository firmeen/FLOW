# Intellectual Property, Brand and Software Ownership

## Objective
A SaaS company must be able to prove that it has the right to use, license, modify, sell access to, and commercially exploit the software, brand, documentation, and other assets forming the service.

## Asset families to document
- source code and repositories;
- database schemas and migrations;
- backend APIs and integration logic;
- UI/UX and design systems;
- logos, wordmarks, illustrations, copy, and brand assets;
- domain names and social handles;
- internal documentation and operating manuals;
- proprietary scripts, automation, prompts, and technical designs;
- customer-specific custom work where ownership/licensing differs;
- third-party/open-source components.

## Ownership-chain method
For each material asset answer:
1. Who created it?
2. Under what relationship?
3. Was it created before or after company incorporation?
4. Does a written agreement assign ownership or grant sufficient rights?
5. Does it contain third-party material?
6. Are there license/attribution/source-disclosure obligations?
7. Where is proof stored?

## Founder-created assets
If founders built FLOW before incorporation, maintain an asset schedule and transfer path into the company. Examples:
- Git repositories;
- brand files;
- domain registrations;
- documentation;
- prototypes;
- design files.

Do not assume incorporation automatically transfers these personally owned assets.

## Contractor/agency work
Before work starts, agreement should establish:
- deliverables;
- ownership or exclusive rights as intended;
- pre-existing materials retained by contractor;
- third-party/open-source disclosure;
- confidentiality;
- source/design-file delivery;
- no hidden dependencies that prevent commercial use;
- handover and deletion obligations.

## Trademark and brand file
Maintain:
- name/logo versions;
- creator/source evidence;
- search/review notes;
- trademark applications/registrations if pursued;
- classes/services covered;
- renewal deadlines;
- authorized brand usage by partners;
- infringement/conflict correspondence if any.

## Open-source compliance register
For each dependency capture:
`component | version | license | usage | modified? | notice required? | source disclosure risk? | owner | review date`

The engineering dependency list and legal license register should connect. A package removed from production should eventually be reflected in the legal inventory.

## Customer customizations
If FLOW builds custom functionality for a customer, the contract must distinguish:
- FLOW platform/core IP;
- reusable generic improvements;
- customer-specific data/content;
- custom deliverables, if any;
- license rights after termination.

Without this separation, one custom project can accidentally create a dispute over ownership of core platform improvements.

## Exit/handover control
Whenever a contributor leaves:
```text
identify outstanding work
→ merge/transfer repositories
→ transfer design/source files
→ confirm IP obligations
→ transfer domains/accounts if relevant
→ revoke access
→ retain agreement + acceptance + handover evidence
```

## Common failures
- repository ownership confused with copyright/IP ownership;
- agency supplies compiled output but no source file;
- designer retains editable logo files;
- domain is registered to former contractor;
- copied third-party code has incompatible license;
- customer believes it owns platform because it paid for customization.
