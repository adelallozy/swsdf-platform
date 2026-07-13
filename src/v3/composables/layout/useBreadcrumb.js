import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { WEB_BASE_URL } from "@/v3/config/apiEndpoints";

export default function useBreadcrumb() {
  const route = useRoute();

  const crumbs = ref([]);

  const updateCrumbs = () => {
    let matched = route.matched;
    let currentBreadcrumbs = [];
    let lastTitle = null;

    matched.forEach((record) => {
      const title = record.meta?.title;
      if (!title) return;

      // Skip consecutive duplicate titles (e.g. AppRoot "Workspace"
      // followed by web-app-index "Workspace") and intermediate redirect
      // wrappers that share a title with their child.
      if (title === lastTitle) return;
      lastTitle = title;

      currentBreadcrumbs.push({
        route: {
          name: record.name,
          params: record.params ? { ...record.params } : {},
        },
        name: title,
      });
    });

    // Drop the second-to-last item if it is an intermediate redirect whose
    // only purpose is reaching the final route (e.g. "Applications" before
    // "My Applications"). Keep it if there are only two items.
    if (currentBreadcrumbs.length > 2) {
      const penultimate = currentBreadcrumbs[currentBreadcrumbs.length - 2];
      const final = currentBreadcrumbs[currentBreadcrumbs.length - 1];
      if (penultimate.name === 'Applications' && final.name !== 'Applications') {
        currentBreadcrumbs.splice(currentBreadcrumbs.length - 2, 1);
      }
    }

    crumbs.value = currentBreadcrumbs.map((c, i, arr) => ({
      ...c,
      isLast: i === arr.length - 1,
    }));
  };

  // External home link — points to the public website, not the app
  const externalHome = WEB_BASE_URL.replace(/\/+$/, "");

  watch(
    route,
    () => {
      updateCrumbs();
    },
    { immediate: true }
  );

  updateCrumbs();

  return { crumbs, externalHome };
}
