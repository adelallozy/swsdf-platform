export default [
  {
    path: "applications/sport-fishing",
    meta: { pageTitle: "Sport Fishing", breadcrumbs: ["Sport Fishing"] },
    children: [
      // create: event id comes from the URL
      {
        path: "events/:eventId(\\d+)/team/new",
        name: "sport-fishing-team-create",
        component: () =>
          import("@/v3/pages/platform/sport-fishing/TeamUpsert.vue"),
        props: (r) => ({ mode: "create", eventId: Number(r.params.eventId) }),
        meta: {
          pageTitle: "SportFishingTeam.New",
          breadcrumbs: ["Sport Fishing", "New Team"],
        },
      },
      // edit: team id
      {
        path: "team/:id(\\d+)",
        name: "sport-fishing-team-edit",
        component: () =>
          import("@/v3/pages/platform/sport-fishing/TeamUpsert.vue"),
        props: (r) => ({ mode: "edit", teamId: Number(r.params.id) }),
        meta: {
          pageTitle: "SportFishingTeam.Edit",
          breadcrumbs: ["Sport Fishing", "Edit Team"],
        },
      },
      // NOTE: your view route already exists (target redirect after save)
      // { path: 'application/:id(\\d+)', name: 'sport-fishing-application-view', component: ... }
    ],
  },
];
