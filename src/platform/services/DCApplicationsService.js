import { ref, reactive } from "vue";

import axios from "axios";

const isLoading = ref(null);
const loadingError = ref(null);

const application = ref(null);
const divingCenterProfile = ref(null);
const divingCenterActivities = ref(null);
const internationlMemberships = ref(null);
const ownerProfile = ref(null);
const managerProfile = ref(null);
const applicationFiles = ref(null);

export function useApplicationsService() {
  async function load(id) {
    isLoading.value = true;

    let data = null;

    await axios
      .get("diving-centers-applications/review/" + id)
      .then((res) => {
        data = res.data;
      })
      .catch((err) => {
        loadingError.value = err;
      });

    if (data?.application) {
      application.value = data.application;
    }

    if (data?.divingCenterProfile) {
      divingCenterProfile.value = data.divingCenterProfile;
    }

    if (data?.ownerProfile) {
      ownerProfile.value = data.ownerProfile;
    }

    if (data?.managerProfile) {
      managerProfile.value = data.managerProfile;
    }

    if (data?.internationlMemberships) {
      internationlMemberships.value = data.internationlMemberships;
    }

    if (data?.applicationFiles) {
      applicationFiles.value = data.applicationFiles;
    }

    isLoading.value = false;
  }

  return {
    isLoading,

    application,
    divingCenterProfile,
    divingCenterActivities,
    internationlMemberships,
    ownerProfile,
    managerProfile,
    applicationFiles,

    load,
  };
}
