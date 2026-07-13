// Main entry aligned for PrimeVue Aura + Tailwind
// Key points:
// 1) Load Tailwind BEFORE your global SCSS so Preflight doesn't wipe your styles.
// 2) Load Aura overrides (swsdf-aura.css) so focus/primary = SWSDF blue.
// 3) (Optional) Load swsdf-prime-fixes.css to ensure clear borders/spacing on Prime inputs.

import { createApp, nextTick } from "vue";
import { createPinia } from "pinia";
import { createGtm } from "@gtm-support/vue-gtm";
import App from "@/App.vue";

// Router & Store
import router from "@/router";
import store from "@/store";

// Plugins
import i18n from "@/core/plugins/i18n.js";
import { registerAxios } from "@/core/plugins/axios";
import { registerComponents } from "@/core/plugins/components";
import { initInlineSvg } from "@/core/plugins/inline-svg";
import { initVeeValidate } from "@/core/plugins/vee-validate";
// PrimeVue & Theme
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import "primeicons/primeicons.css";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";
import Tooltip from "primevue/tooltip";

import VueSocialSharing from "vue-social-sharing";
import { install } from "vue3-recaptcha-v2";
import VueGoogleMaps from "@fawmi/vue-google-maps";

// --------------------
// 🔽 CSS IMPORT ORDER
// --------------------
// ✅ 1) Tailwind base/components/utilities FIRST
import "./v3/assets/tailwind.css";
// ✅ 2) Aura tokens override to SWSDF blue (focus ring, primary scale)
import "./v3/theme/swsdf-aura.css";
// ✅ 3) Fix pack for Prime inputs (borders, spacing) scoped to .auth_login
import "./v3/theme/swsdf-prime-fixes.css";
import "./v3/theme/swsdf-typography.css";
import "./v3/theme/auth-tweaks.scss";

// Global Styles (after Tailwind so your SCSS can override Preflight if needed)
import "@/assets/sass/style.scss";
import "vue3-toastify/dist/index.css";
import "@/core/plugins/prismjs";

// Global Components
import Loading from "@/components/Loading.vue";
import { ErrorMessage, Field, Form } from "vee-validate";
import { useErrorHandler } from "@/v3/composables/useErrorHandler";
import axios from "axios";

// Event Bus
import mitt from "mitt";

// Create app
const app = createApp(App);
const pinia = createPinia();
const emitter = mitt();

const GMAP_KEY = import.meta.env.VITE_GMAP_KEY;

// Global Properties
app.config.globalProperties.emitter = emitter;
app.config.globalProperties.axios = axios;

// Component Registration
app.component("main-loading", Loading);
app.component("VeeErrorMessage", ErrorMessage);
app.component("VeeField", Field);
app.component("VeeForm", Form);

// Plugin Usage
app.use(pinia);
app.use(store);
app.use(router);
app.use(VueSocialSharing);
// app.use(ElementPlus, { size: 'small', zIndex: 3000 })

app.use(VueGoogleMaps, {
  load: {
    async: true,
    key: GMAP_KEY,
    libraries: "places",
  },
});

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: ".dark",
      cssLayer: {
        name: "primevue",
        order: "tailwind-base, primevue, tailwind-utilities",
      },
    },
  },
});

app.use(ToastService);
app.use(ConfirmationService);
app.directive("tooltip", Tooltip);

// Custom Plugin Registrations
registerAxios(app);
registerComponents(app);
initInlineSvg(app);
initVeeValidate();
app.use(i18n);
app.use(install, {
  sitekey: "6LcG2l4pAAAAAOliOOrL89JOAVcoYGP5PY0faaWq",
  cnDomains: false,
});

app.use(
  createGtm({
    id: "GTM-TN2FC6XV",
    defer: true, // Script can be set to `defer` to speed up page load at the cost of less accurate results (in case visitor leaves before script is loaded, which is unlikely but possible). Defaults to false, so the script is loaded `async` by default

    enabled: import.meta.env.PROD && typeof window !== "undefined",
    debug: import.meta.env.DEV, // Whether or not display console logs debugs (optional)
    loadScript: true, // Whether or not to load the GTM Script (Helpful if you are including GTM manually, but need the dataLayer functionality in your components) (optional)
    vueRouter: router, // Pass the router instance to automatically sync with router (optional)
    // ignoredViews: ['homepage'], // Don't trigger events for specified router names (optional)
    trackOnNextTick: true, // Whether or not call trackView in Vue.nextTick
  })
);

// Mount app
const { capture } = useErrorHandler();
app.config.errorHandler = (err, instance, info) => {
  console.error("[Vue Error Handler]", err);
  console.warn("Error info:", info);
  console.log("Component instance:", instance);
  capture(err);
};

nextTick(() => {
  app.provide("axios", app.config.globalProperties.axios); // optional axios injection
});

app.mount("#app");
