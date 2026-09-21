# SWSDF Platform Documentation

Private platform documentation for the SWSDF application.

## Structure

```
docs/
├── README.md                 ← You are here
├── swsdf-platform-work-context.md ← Canonical current state and resume entry point
├── START_HERE.md             ← Entry point for refactoring, fixes, features, and docs updates
├── architecture/             System architecture & patterns
│   ├── overview.md           Routing, state, HTTP client, error handling, config
│   └── kickoff-templates.md  Entity index grid kickoff patterns
├── guides/                   Deployment and operational guides
│   ├── production-deployment.md       Complete production deployment and rollback runbook
│   └── private-docker-hub-image.md  Build, push, pull, and roll back the private nginx image
├── v3/                       v3 architecture docs
│   ├── guides/               Development guides
│   │   ├── global-guide.md              Coding standards, forbidden deps, layout rules
│   │   ├── refactoring-guide.md         Refactoring process & rules
│   │   ├── masterform-guide.md          MasterForm schema-driven forms
│   │   ├── masterform-migration-guide.md Migrating legacy forms to MasterForm
│   │   ├── translation-guide.md         i18n strategy & patterns
│   │   ├── schema-building-guide.md     Valibot schema building
│   │   ├── api-endpoints-naming-convention.md  API endpoint naming rules
│   │   └── unified-entity-loading-migration.md  Entity loading migration
│   ├── specs/                Feature technical specifications
│   │   ├── professional-diver-new-license.md
│   │   ├── professional-diver-license-information.md
│   │   ├── professional-diver-license.md
│   │   ├── sport-fishing-competition-team-registration.md
│   │   ├── athlete-registration.md
│   │   ├── athlete-profile-renewal.md
│   │   ├── application-fees-card.md
│   │   └── ActionsTrackingCard.md
│   ├── requirements/         Feature requirements
│   │   ├── user-profile-upsert.md
│   │   ├── sport-fishing-competition-team-registration.md
│   │   ├── professional-diver-memberships.md
│   │   ├── professional-diver-new-license.md
│   │   ├── professional-diver-work-contracts.md
│   │   ├── dive-center-profile-edit.md
│   │   ├── dive-center-applications.md
│   │   ├── dive-center-activities-edit.md
│   │   ├── diving-center-new-membership.md
│   │   ├── athlete-registration.md
│   │   ├── athlete-profile-renewal.md
│   │   ├── application-fees-card.md
│   │   └── applications-index-ui.md
│   ├── design/               Design system
│   │   └── professional-diver-design-system.md
│   ├── components/           Component docs
│   │   ├── ApplicantPersonalPhotoCard.md
│   │   ├── PDWorkContractsCard.md
│   │   └── PhotoInput.md
│   ├── composables/          Composable docs
│   │   ├── useApplicationStore.md
│   │   └── useLoading Composable Guide.md
│   ├── pages/                Page docs
│   │   ├── ApplicationSummary.md
│   │   └── ApplicantPersonalPhotoUpload.md
│   ├── state/                State management docs
│   │   └── application-store.md
│   ├── style/                Styling docs
│   │   └── cards.md
│   ├── analysis/             Analysis & comparison docs
│   │   └── user-profile-upsert-comparison.md
│   ├── reference/            Reference docs
│   │   ├── website-pages-list.md   Curated route list
│   │   ├── payload-system.md       Payload data model
│   │   ├── forms-index.md          Forms documentation index
│   │   ├── http-client.md           Canonical HTTP and authentication lifecycle contract
│   │   └── issues-and-fixes.md      Known issues & fixes
│   └── operations/           v3 operational tracking
│       ├── pd-new-license-profile-prefill-implementation.md Professional diver prefill implementation
│       ├── refactoring-backlog-website-components.md  Website component migration backlog
│       ├── refactoring-gap-analysis.md                Legacy vs v3 gap analysis
│       ├── refactoring-feature-comparison-prompt.md   Feature comparison prompt
│       └── applications-index-ui-task-list.md         Applications list UI implementation backlog
├── operations/               Task tracking
│   ├── public-page-removal-tracker.md       Audit trail of all removed public pages
│   ├── public-page-removal-resume-context.md Public page removal task status
│   ├── legacy-dependency-migration-progress.md Axios and legacy plugin migration audit
│   └── specs-issues.md                      Known specs issues
└── reference/                Auto-generated & tooling
    ├── website-pages.md              Auto-generated route inventory
    └── translations-audit-guide.md   Translation audit tooling guide
```

## Quick Links

**Resuming any task?**
→ `swsdf-platform-work-context.md` for current state, deployment rules, known follow-up work, and the resume prompt
→ `START_HERE.md` for task lanes, source-of-truth order, and docs update rules

**Working on Vendor Registration?**
→ `../../Docs/Vendor Registration/README.md` for the cross-project document index
→ `../../Docs/Vendor Registration/vendor-registration-resume-context.md` for authoritative links, remaining work, and release checks
→ `v3/requirements/vendor-contacts.md` and `v3/specs/vendor-contacts.md` for local pointers to the canonical contact documents

**Publishing the private nginx image?**
→ `guides/private-docker-hub-image.md` for Docker Hub repository creation, image build/push, production pull, and rollback

**Deploying to production?**
→ `guides/production-deployment.md` for server preparation, versioned bundle synchronization, nginx, Cloudflare, verification, and rollback

**Checking legacy dependency cleanup?**
→ `operations/legacy-dependency-migration-progress.md` for Axios and legacy plugin migration status

**Porting a fix from the original project?**
→ `START_HERE.md` → “Port A Fix From The Original Project” before copying code
→ `operations/public-page-removal-tracker.md` to avoid restoring removed public pages

**Starting a new feature?**
→ `v3/guides/global-guide.md` for coding standards
→ `v3/guides/refactoring-guide.md` for the refactoring process

**Integrating an API?**
→ `v3/reference/http-client.md` for request helpers, normalized errors, JWT/401 behavior, and caller responsibilities

**Building a form?**
→ `v3/guides/masterform-guide.md` for MasterForm usage
→ `v3/guides/schema-building-guide.md` for Valibot schemas

**Need to know the routes?**
→ `reference/website-pages.md` for the full route inventory
→ `v3/reference/website-pages-list.md` for the curated route list

**Working on translations?**
→ `v3/guides/translation-guide.md` for i18n patterns
→ `reference/translations-audit-guide.md` for the audit tool

**Improving the applications list UI?**
→ `v3/requirements/applications-index-ui.md` for behavior and acceptance criteria
→ `v3/operations/applications-index-ui-task-list.md` for implementation phases and verification

**System architecture?**
→ `architecture/overview.md` for routing, state, HTTP, error handling
