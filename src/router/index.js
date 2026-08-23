import { createRouter, createWebHistory } from "vue-router";
import store from "@/store";
import i18n from "@/core/plugins/i18n.js";
const t = i18n.global.t;
const locale = i18n.global.locale;

import usePageHeading from "@/v3/composables/layout/usePageHeading.js";
const { setHeading } = usePageHeading();

import { signOut, isAuthenticated } from "@/v3/composables/useAuth.js";

const resolveLocale = (candidate) => {
  if (candidate === "ar" || candidate === "en") {
    return candidate;
  }

  const globalLocale =
    i18n.global.locale?.value ||
    i18n.global.locale ||
    localStorage.getItem("locale");
  return globalLocale === "en" ? "en" : "ar";
};

const routes = [
  {
    path: "/:locale(ar|en)",
    name: "AppRoot",
    component: () => import("@/v3/layouts/MainLayout.vue"),
    meta: {
      auth: true,
      authGuard: "auth",
      pageTitle: "Workspace",
      title: "Workspace",
    },
    redirect: (to) => ({
      name: "workspace-index",
      params: { locale: to.params.locale },
    }),
    children: [
      {
        path: "",
        name: "workspace-index",
        component: () => import("@/website/profile/index.vue"),
        meta: {
          auth: true,
        },
      },
      {
        path: "athlete-registration",
        name: "athlete-registration",
        component: () => import("@/platform/views/athletes/Profile.vue"),
      },

      {
        path: "applications",
        component: () => import("@/platform/views/Applications/Home.vue"),
        name: "applications",
        meta: {
          title: "Applications",
        },
        redirect: (to) => ({
          name: "applications-index",
          params: { locale: to.params.locale || resolveLocale() },
        }),
        children: [
          {
            path: "",
            name: "applications-index",
            component: () =>
              import("@/v3/pages/applications/ApplicationsIndex.vue"),
            meta: {
              auth: true,
              authGuard: "auth",
              pageTitle: "My applications",
              title: "My applications",
            },
          },

          {
            path: "professional-diver-new-license",
            name: "professional-diver-new-license",
            component: () =>
              import(
                "@/v3/pages/applications/professional-divers/NewLicense.vue"
              ),
            meta: {
              auth: true,
              authGuard: "auth",
              pageTitle: "Professional Diver New License Application",
              title: "Professional Diver New License Application",
            },
          },
          {
            path: "athlete-new-registration",
            name: "athlete-new-registration",
            component: () =>
              import("@/v3/pages/applications/athletes/NewAthlete.vue"),
            meta: {
              auth: true,
              authGuard: "auth",
              pageTitle: "New Athlete Registration",
              title: "New Athlete Registration",
            },
          },

          {
            path: "diving-centers-new-membership",
            name: "diving-centers-new-membership",
            component: () =>
              import("@/v3/pages/applications/dive-centers/NewMembership.vue"),
            meta: {
              auth: true,
              authGuard: "auth",
              pageTitle: "Diving Center New Membership",
              title: "Diving Center New Membership",
            },
          },

          {
            path: "vendor-registration",
            name: "vendor-registration",
            component: () =>
              import("@/v3/pages/applications/vendors/NewRegistration.vue"),
            meta: {
              auth: true,
              authGuard: "auth",
              pageTitle: "Vendor Registration",
              title: "Vendor Registration",
            },
          },

          {
            path: "underwater-photography-competition-registration/:eventId(\\d+)",
            name: "underwater-photography-competition-registration",
            component: () =>
              import(
                "@/platform/views/Applications/competitions/underwater-photography/NewRegistration.vue"
              ),
            meta: {
              pageTitle: "Freediving Competition Participation",
              auth: true,
            },
          },
          {
            path: "freediving-competition-registration/:id(\\d+)",
            name: "freediving-competition-registration",
            component: () =>
              import(
                "@/platform/views/Applications/competitions/free-diving/NewRegistration.vue"
              ),
            meta: {
              pageTitle: "Freediving Competition Participation",
              auth: true,
            },
          },
          {
            path: "jetsky-competition-registration/:event",
            name: "jetsky-competition-registration",
            component: () =>
              import(
                "@/platform/views/Applications/competitions/jetsky/NewRegistration.vue"
              ),
            meta: {
              pageTitle: "Jetsky Competition Participation",
              auth: true,
            },
          },

          {
            path: "fishing-new-team-registration/:eventId(\\d+)",
            name: "fishing-new-team-registration",
            component: () =>
              import("@/v3/pages/applications/sport-fishing/TeamUpsert.vue"),
            meta: {
              pageTitle: "Sport Fishing Championship Registration Application",
            },
          },

          {
            path: "underwater-photography-competition-registration/:event",
            name: "underwaterunderwater-competition-registration-photography-competition-registration",
            component: () =>
              import(
                "@/platform/views/Applications/competitions/underwater-photography/NewRegistration.vue"
              ),
            meta: {
              pageTitle: "Jetsky Competition Participation",
            },
          },
          {
            path: "new-athlete",
            name: "new-athlete",
            redirect: (to) => ({
              name: "athlete-new-registration",
              params: {
                locale: to.params.locale || resolveLocale(),
              },
            }),
            meta: {
              pageTitle: "New Athlete Registration",
            },
          },

          {
            name: "sport-fishing-register",
            path: "sport-fishing-register/:eventId(\\d+)",
            component: () =>
              import("@/v3/pages/applications/sport-fishing/TeamUpsert.vue"),
            props: (route) => ({
              eventId: Number(route.params.eventId),
              mode: "create",
            }),
          },
          {
            name: "fishing-team-update",
            path: "sport-fishing-team-update/:appId(\\d+)",
            component: () =>
              import("@/v3/pages/applications/sport-fishing/TeamUpsert.vue"),
            props: (route) => ({
              eventId: Number(route.params.eventId),
              mode: "create",
            }),
          },

          {
            name: "app-summary",
            path: ":appId(\\d+)/summary",
            component: () =>
              import("@/v3/pages/applications/ApplicationSummary.vue"),
            props: true,
          },
          {
            name: "app-waiver",
            path: ":appId(\\d+)/waiver",
            component: () => import("@/v3/pages/applications/Waiver.vue"),
            props: true,
          },
          {
            name: "app-new-files",
            path: ":appId(\\d+)/new-files",
            component: () =>
              import("@/v3/pages/applications/ApplicationFiles.vue"),
            props: true,
          },
          {
            path: ":appId(\\d+)/add-fishing-participant",
            name: "fishing-participant-add",
            component: () =>
              import(
                "@/v3/pages/applications/sport-fishing/ParticipantAdd.vue"
              ),
            meta: {
              requiresAuth: true,
              title: "Add Participant",
            },
          },
          {
            path: ":appId(\\d+)/professional-divers/add-membership",
            name: "pd-membership-add",
            component: () =>
              import(
                "@/v3/pages/applications/professional-divers/AddMembership.vue"
              ),
            meta: {
              requiresAuth: true,
              title: "Add International Membership",
            },
          },
          {
            path: ":appId(\\d+)/professional-divers/add-contract",
            name: "pd-contract-add",
            component: () =>
              import(
                "@/v3/pages/applications/professional-divers/AddContract.vue"
              ),
            meta: {
              requiresAuth: true,
              title: "Add Work Contract",
            },
          },

          {
            path: ":appId(\\d+)/file-upload",
            name: "application-file-upload",
            component: () =>
              import("@/v3/pages/applications/ApplicationFileUpload.vue"),
            meta: { requiresAuth: true },
          },

          {
            path: ":appId/personal-photo-upload",
            name: "applicant-personal-photo-upload",
            component: () =>
              import(
                "@/v3/pages/applications/ApplicantPersonalPhotoUpload.vue"
              ),
            meta: { requiresAuth: true },
          },

          {
            path: "user-profile-edit/:appId(\\d+)",
            name: "user-profile-edit",
            component: () =>
              import("@/v3/pages/applications/UserProfileUpsert.vue"),
            meta: {
              requiresAuth: true,
              pageTitle: "Update personal information",
            },
          },
          {
            path: ":appId(\\d+)/athletes/update-sport",
            name: "athlete-sport-selection",
            component: () =>
              import("@/v3/pages/applications/athletes/UpdateAthleteSport.vue"),
            meta: {
              requiresAuth: true,
              pageTitle: "Update Sport",
              title: "Update Sport",
            },
          },
          {
            path: ":appId(\\d+)/professional-divers/update-license-informations",
            name: "pd-license-info-update",
            component: () =>
              import(
                "@/v3/pages/applications/professional-divers/UpdateLicenseInformations.vue"
              ),
            meta: {
              requiresAuth: true,
              pageTitle: "License Informations",
              title: "License Informations",
            },
          },
          {
            path: ":appId(\\d+)/dive-centers/profile/edit",
            name: "dive-center-profile-edit",
            component: () =>
              import(
                "@/v3/pages/applications/dive-centers/UpdateCenterProfile.vue"
              ),
            meta: {
              requiresAuth: true,
              pageTitle: "Update Center Profile",
              title: "Update Center Profile",
            },
          },
          {
            path: ":appId(\\d+)/vendors/profile/edit",
            name: "vendor-profile-edit",
            component: () =>
              import("@/v3/pages/applications/vendors/UpdateVendorProfile.vue"),
            meta: {
              requiresAuth: true,
              pageTitle: "Update Vendor Profile",
              title: "Update Vendor Profile",
            },
          },
          {
            path: ":appId(\\d+)/vendors/contact-updates/add",
            name: "vendor-contact-update-add",
            component: () =>
              import("@/v3/pages/applications/vendors/AddVendorContactUpdate.vue"),
            meta: {
              requiresAuth: true,
              pageTitle: "Add Contact",
              title: "Add Contact",
            },
          },
          {
            path: ":appId(\\d+)/dive-centers/activities/edit",
            name: "dive-center-activities-edit",
            component: () =>
              import(
                "@/v3/pages/applications/dive-centers/UpdateActivities.vue"
              ),
            meta: {
              requiresAuth: true,
              pageTitle: "Update Diving Activities",
              title: "Update Diving Activities",
            },
          },
          {
            path: ":appId(\\d+)/dive-centers/administrators/edit",
            redirect: (to) => ({
              name: "dive-center-administrator-add",
              params: {
                appId: to.params.appId,
                locale: to.params.locale || resolveLocale(),
              },
            }),
          },
          {
            path: ":appId(\\d+)/dive-centers/administrators/add",
            name: "dive-center-administrator-add",
            component: () =>
              import(
                "@/v3/pages/applications/dive-centers/DCAdministratorUpsert.vue"
              ),
            meta: {
              requiresAuth: true,
              pageTitle: "Add Administrator",
              title: "Add Administrator",
            },
          },
          {
            path: ":appId(\\d+)/dive-centers/administrators/:profileId(\\d+)/edit",
            name: "dive-center-administrator-edit",
            component: () =>
              import(
                "@/v3/pages/applications/dive-centers/DCAdministratorUpsert.vue"
              ),
            meta: {
              requiresAuth: true,
              pageTitle: "Update Administrator",
              title: "Update Administrator",
            },
          },
          {
            path: ":appId(\\d+)/dive-centers/international-memberships/add",
            name: "dive-center-international-membership-add",
            component: () =>
              import(
                "@/v3/pages/applications/dive-centers/AddInternationalMembership.vue"
              ),
            meta: {
              requiresAuth: true,
              pageTitle: "Add International Membership",
              title: "Add International Membership",
            },
          },

          {
            path: ":id(\\d+)",
            name: "application-home",

            component: () =>
              import("@/platform/views/Applications/Application.vue"),
            children: [
              {
                path: "underwater-photography-competition-application",
                name: "underwater-photography-competition-application",
                props: true,

                component: () =>
                  import(
                    "@/platform/views/Applications/competitions/underwater-photography/ApplicationReview.vue"
                  ),
              },
              {
                path: "update-underwater-participation-competition-application/:participantId",
                name: "update-underwater-participation-competition-application",
                props: true,

                component: () =>
                  import(
                    "@/platform/views/Applications/competitions/underwater-photography/UpdateInformation.vue"
                  ),
              },
              {
                path: "update-jetsky-competition-application/:event",
                name: "update-jetsky-competition-application",
                props: true,

                component: () =>
                  import(
                    "@/platform/views/Applications/competitions/jetsky/UpdateInformation.vue"
                  ),
              },
              {
                path: "jetsky-competition-application",
                name: "jetsky-competition-application",
                props: true,

                component: () =>
                  import(
                    "@/platform/views/Applications/competitions/jetsky/ApplicationReview.vue"
                  ),
              },

              {
                path: "freediving-competition-application",
                name: "freediving-competition-application",
                component: () =>
                  import(
                    "@/platform/views/Applications/competitions/free-diving/ApplicationReview.vue"
                  ),
                meta: {
                  pageTitle: "Freediving Competition Participation",
                },
              },
              {
                path: "add-working-leave",
                name: "add-working-leave",
                component: () =>
                  import(
                    "@/platform/views/Applications/competitions/free-diving/NewWorkLeave.vue"
                  ),
                meta: {
                  pageTitle: "Add working leave",
                },
              },

              {
                path: "update-user-profile",
                name: "update-user-profile",
                component: () =>
                  import("@/platform/views/Applications/UpdateUserProfile.vue"),
                meta: {
                  pageTitle: "Applicant Personal Information",
                },
              },
              {
                path: "update-license-informations",
                name: "professional-diver-application-license-informations",
                component: () =>
                  import(
                    "@/platform/views/Applications/professional-divers/LicenseInformations.vue"
                  ),
                meta: {
                  pageTitle: "License Informations",
                },
              },
              {
                path: "add-new-athlete",
                name: "add-new-athletes",
                component: () =>
                  import("@/platform/views/Applications/AddAthletes.vue"),
                meta: {
                  pageTitle: "Add New Athletes",
                },
              },
              {
                path: "update-athletes-sport",
                name: "update-athletes-sport",
                redirect: (to) => ({
                  name: "athlete-sport-selection",
                  params: {
                    appId: to.params.id,
                    locale: to.params.locale || resolveLocale(),
                  },
                }),
                meta: {
                  pageTitle: "Update Sport",
                },
              },
              {
                path: "athletes-membership-profile",
                name: "athletes-membership-profile",
                redirect: (to) => ({
                  name: "app-summary",
                  params: {
                    appId: to.params.id,
                    locale: to.params.locale || resolveLocale(),
                  },
                }),
                meta: {
                  pageTitle: "New Athlete Registration",
                },
              },

              {
                path: "update-user-photo",
                name: "update-user-photo",
                component: () =>
                  import("@/v3/pages/applications/ApplicationPhotoUpload.vue"),
                meta: {
                  pageTitle: "Personal Picture",
                },
              },
              {
                path: "new-file",
                name: "new-application-file",
                component: () =>
                  import("@/v3/components/Applications/UploadFiles.vue"),
                meta: {
                  pageTitle: "New Application File",
                },
              },
              {
                path: "add-new-file",
                name: "add-new-file",
                component: () =>
                  import("@/v3/components/Applications/UploadFiles.vue"),
                meta: {
                  pageTitle: "Upload New File",
                },
              },
            ],
          },
        ],
      },

      {
        path: "user-applications",
        name: "user-applications",
        redirect: (to) => ({
          name: "applications-index",
          params: { locale: to.params.locale || resolveLocale() },
        }),
      },
      {
        path: "platform-applications",
        name: "platform-applications",
        redirect: (to) => ({
          name: "applications-index",
          params: { locale: to.params.locale || resolveLocale() },
        }),
      },

      {
        path: "dive-centers",
        name: "diving-center-membership",
        component: () =>
          import("@/v3/pages/app/dive-centers/DiveCentersIndex.vue"),
        meta: {
          auth: true,
          authGuard: "auth",
          title: "Dive Centers",
          pageTitle: "Dive Centers",
        },
      },
      {
        path: "dive-center/:id(\\d+)",
        name: "diving-center-show",
        component: () =>
          import("@/v3/pages/app/dive-centers/DiveCenterProfile.vue"),
        meta: {
          auth: true,
          authGuard: "auth",
          title: "Dive Centers",
          pageTitle: "Dive Centers",
        },
      },
      {
        path: "vendors",
        name: "vendor-profile",
        component: () =>
          import("@/v3/pages/app/vendors/VendorProfileView.vue"),
        meta: {
          auth: true,
          authGuard: "auth",
          title: "Vendors",
          pageTitle: "Vendor Profile",
        },
      },

      {
        path: "professional-diver-license",
        name: "professional-diver-license",
        component: () =>
          import("@/v3/pages/professional-divers/ProfessionalDiverProfile.vue"),
        meta: {
          auth: true,
          authGuard: "auth",
          pageTitle: "Personal profile",
          title: "Professional Divers",
        },
      },
      {
        path: "athlete-profile",
        name: "athlete-profile",
        component: () => import("@/v3/pages/athletes/AthleteProfile.vue"),
        meta: {
          auth: true,
          authGuard: "auth",
          pageTitle: "Personal profile",
          title: "Athletes",
        },
      },
      {
        path: "account-settings",
        name: "account-settings",
        component: () => import("@/v3/pages/AccountSettings.vue"),
        meta: {
          auth: true,
          authGuard: "auth",
          pageTitle: "Account Settings",
          title: "Account Settings",
        },
      },
      {
        path: "invoices/view/:id(\\d+)",
        name: "quotation-view",
        component: () => import("@/v3/pages/quotations/QuotationItemsView.vue"),
        meta: {
          auth: true,
          authGuard: "auth",
          pageTitle: "Details of the fee",
          title: "Details of the fee",
        },
      },
      {
        path: "invoices/:id(\\d+)",
        name: "invoice-view",
        component: () => import("@/v3/pages/invoices/index.vue"),
        meta: {
          auth: true,
          pageTitle: "Invoices",
          authGuard: "auth",
        },
      },
      {
        path: "invoice-review/:id(\\d+)",
        name: "invoice-review",
        component: () => import("@/platform/views/invoices/Review.vue"),
        meta: {
          auth: true,
          pageTitle: "Invoice Review",
          authGuard: "auth",
        },
      },

      {
        path: "payments/confirm-payment/:id(\\d+)",
        name: "confirm-payment",
        component: () => import("@/v3/pages/payments/ConfirmPayment.vue"),
        meta: {
          auth: false,
        },
      },

      {
        path: "paylink",
        name: "paylink-index",
        children: [
          {
            path: "confirm-payment",
            name: "confirm-paylink-payment",
            component: () =>
              import("@/platform/views/paylink/ConfirmPayment.vue"),
          },
        ],
      },
    ],
  },

  {
    path: "/",
    redirect: () => `/${resolveLocale()}`,
  },

  {
    path: "/workspace",
    name: "workspace",
    redirect: () => ({
      name: "workspace-index",
      params: { locale: resolveLocale() },
    }),
  },

  {
    path: "/payments/confirm-payment/:id(\\d+)",
    redirect: (to) => ({
      name: "confirm-payment",
      params: { locale: resolveLocale(), id: to.params.id },
    }),
  },

  {
    path: "/paylink/confirm-payment",
    redirect: () => ({
      name: "confirm-paylink-payment",
      params: { locale: resolveLocale() },
    }),
  },
  {
    path: "/:locale(ar|en)/platform",
    name: "platform-index",
    redirect: (to) => ({
      name: "AppRoot",
      params: { locale: to.params.locale || resolveLocale() },
    }),
  },
  {
    path: "/quotations/pay-invoice/:id(\\d+)",
    redirect: (to) => {
      return {
        name: "invoice-review",
        params: { locale: resolveLocale(), id: to.params.id },
      };
    },
  },

  {
    path: "/auth/:pathMatch(.*)*",
    redirect: (to) => {
      const locale = resolveLocale();
      const pathMatch = Array.isArray(to.params?.pathMatch)
        ? to.params.pathMatch.join("/")
        : String(to.params?.pathMatch || "");

      return {
        path: pathMatch ? `/${locale}/auth/${pathMatch}` : `/${locale}/auth`,
        query: to.query,
      };
    },
  },

  {
    path: "/:locale(ar|en)/auth",
    component: () => import("@/v3/layouts/Auth.vue"),
    redirect: (to) => {
      return {
        name: "sign-in",
        params: {
          locale: resolveLocale(to.params?.locale),
        },
      };
    },
    meta: {
      meta: true,
    },
    children: [
      {
        path: "sign-in",
        name: "sign-in",
        component: () => import("@/v3/components/Authentication/SignIn.vue"),
        meta: {
          guest: true,
        },
      },
      {
        path: "sign-up",
        name: "sign-up",
        component: () => import("@/v3/components/Authentication/SignUp.vue"),
        meta: {
          pageTitle: "Register new User account",
          guest: true,
        },
      },

      {
        path: "reset-password/:token?",
        name: "reset-password ",
        component: () =>
          import("@/v3/components/Authentication/ResetPassword.vue"),
        meta: {
          pageTitle: "Change password",
          guest: false,
        },
      },
      {
        path: "forgot-password",
        name: "forgot-password",
        component: () =>
          import("@/v3/components/Authentication/ForgotPassword.vue"),
        meta: {
          pageTitle: "Reset password",
          guest: true,
        },
      },
      {
        path: "verify-email",
        name: "verify-email",
        component: () =>
          import("@/v3/components/Authentication/VerifyEmail.vue"),
        meta: {
          pageTitle: "Verify your email",
          guest: true,
        },
      },
      {
        path: "change-email",
        name: "change-email",
        component: () =>
          import("@/v3/components/Authentication/ChangeEmail.vue"),
        meta: {
          pageTitle: "Change email",
          guest: true,
        },
      },
    ],
  },

  {
    path: "/404",
    name: "404",
    redirect: { name: "error-404" },
  },

  {
    path: "/404/:redirect(.*)?",
    name: "error-404",
    component: () => import("@/v3/pages/system/NotFound404.vue"),
    props: (route) => ({
      redirect: route.params.redirect || "",
      target: route.query.target || "",
    }),
  },

  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    redirect: (to) => {
      const missed = Array.isArray(to.params.pathMatch)
        ? "/" + to.params.pathMatch.join("/")
        : "/" + (to.params.pathMatch || "");
      return { name: "error-404", query: { target: missed } };
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// router.beforeEach
router.beforeEach((to, from, next) => {
  // —— Locale auto-fill for name-based navigations missing the locale param ——
  const needsLocale =
    to.matched.length > 0 &&
    to.matched.some((record) => /:locale/.test(record.path));

  if (
    needsLocale &&
    (!to.params.locale ||
      (to.params.locale !== "ar" && to.params.locale !== "en"))
  ) {
    const resolvedLocale = from.params.locale || resolveLocale();
    if (to.name) {
      return next({
        name: to.name,
        params: { ...to.params, locale: resolvedLocale },
        query: to.query,
        hash: to.hash,
      });
    }
    return next({
      path: `/${resolvedLocale}${to.path}`,
      query: to.query,
      hash: to.hash,
    });
  }

  // —— Locale handling (from :locale param) ——
  const t = i18n.global.t;
  const currentLocale = i18n.global.locale?.value || i18n.global.locale;
  const loc = to.params && to.params.locale;

  if (loc && (loc === "ar" || loc === "en")) {
    if (currentLocale !== loc) {
      // Vue I18n v9 exposes locale as a ref; v8 as string. Support both.
      if (
        i18n.global.locale &&
        typeof i18n.global.locale === "object" &&
        "value" in i18n.global.locale
      ) {
        i18n.global.locale.value = loc;
      } else {
        i18n.global.locale = loc;
      }

      localStorage.setItem("locale", loc);
    }
    document.documentElement.setAttribute("lang", loc);
    document.documentElement.setAttribute("dir", loc === "ar" ? "rtl" : "ltr");
  }

  // —— Title / heading handling ——
  // meta.pageTitle holds the literal English key. Translate exactly once
  // here for the browser tab title; PageHeading performs its own single
  // translation pass when rendering the heading.
  const pageTitleKey = (to.meta && to.meta.pageTitle) || "";

  document.title = pageTitleKey
    ? [t(pageTitleKey), t("appName")].filter(Boolean).join(" | ")
    : t("appName");

  if (pageTitleKey) {
    setHeading({
      title: pageTitleKey,
      visible: true,
    });
  }

  // —— Layout reset ——
  store.commit("resetLayoutConfig");

  if (to.meta?.auth && !isAuthenticated.value) {
    localStorage.setItem("last_page", to.fullPath || to.path);
    next({
      name: "sign-in",
      params: {
        locale: resolveLocale(to.params?.locale),
      },
      query: {
        redirect: to.fullPath || to.path,
      },
    });
  } else {
    next();
  }

  // —— Scroll to top on every navigation ——
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 100);
});

export default router;
