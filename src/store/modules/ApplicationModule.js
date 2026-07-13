import httpService from "@/core/services/HttpService.js";
import LinkedList from "@/assets/js/LinkedList.js";
import router from "@/router/index.js";

export default {
  state() {
    return {
      userApplication: null,
      userApplications: [],
      linkedSteps: {},
      licensedDiveCenters: [],
      errors: {},
      regionsList: [],
      regionCitiesList: [],
      licensedDiveCentersList: [],
      diveCentersList: [],
    };
  },

  mutations: {
    SET_APPLICATION(state, application) {
      state.userApplication = application;
    },

    SET_USER_APPLICATIONS(state, applications) {
      state.userApplications = applications;
    },

    SET_APPLICANT_PROFILE(state, applicant_profile) {
      state.userApplication.applicant_profile = applicant_profile;
    },

    SET_ERRORS(state, errors) {
      state.errors = { ...errors };
    },

    SET_LINKED_STEPS(state, steps) {
      state.linkedSteps = new LinkedList(steps);
    },

    MOVE_TO(state, stepTitle) {
      state.linkedSteps.moveTo(stepTitle);
    },

    SET_LICENSED_DIVE_CENTERS(state, diveCenters) {
      state.licensedDiveCenters = diveCenters;
    },

    SET_REGIONS_LIST(state, list) {
      state.regionsList = list;
    },

    SET_REGION_CITIES_LIST(state, list) {
      state.regionCitiesList = list;
    },
  },
  actions: {
    newApplication({ commit }) {
      httpService
        .get("applications/new-application/professional-diver-new-license")
        .then((data) => {
          if (data.constructor.name == "Response") {
            if (data.status == "404") {
              router.push({ name: "404" });
            }

            if (data.status == "409" && data.statusText == "Duplicate") {
              router.push({ name: "user-applications" });
            }

            if (data.status == "409" && data.statusText == "Licensed") {
              router.push({ name: "professional-diver-license" });
            }
          }

          if (!data.application) {
            return;
          }

          router
            .push({
              name: "professional-diver-license-application",
              params: { id: data.application.id },
            })
            .then(() => {
              window.location.reload();
            });

          commit("SET_APPLICATION", data.application);
          commit("SET_LINKED_STEPS", data.steps);
        })
        .catch((error) => {
          commit("SET_ERROR", [error.message]);
        });
    },

    getApplication({ commit }, id) {
      httpService
        .get("applications/get-application/" + id)
        .then((data) => {
          if (data.constructor.name == "Response") {
            if (data.status == "404") {
              router.push({ name: "404" });
            }
          }

          commit("SET_APPLICATION", data.application);
          commit("SET_LINKED_STEPS", data.steps);
        })

        .catch((error) => {
          commit("SET_ERROR", [error.message]);
        });
    },

    getUserApplications({ commit }) {
      httpService
        .get("applications/get-user-applications")
        .then((data) => {
          if (data.constructor.name == "Response") {
            if (data.status == "404") {
              router.push({ name: "404" });
            }
          }

          commit("SET_USER_APPLICATIONS", data.applications);
        })

        .catch((error) => {
          commit("SET_ERROR", [error.message]);
        });
    },

    getLicensedDiveCenters({ commit }) {
      httpService
        .get("dive-centers/get-licensed-centers")
        .then((data) => {
          // if (data.constructor.name == 'Response') {
          //     if(data.status == '404' ) {
          //         router.push({ name: "404" });
          //     }
          // }
          commit("SET_LICENSED_DIVE_CENTERS", data.diveCenters);
        })

        .catch((error) => {
          commit("SET_ERROR", [error.message]);
        });
    },

    getRegionsList({ commit }) {
      httpService
        .get("commons/get-regions-list")
        .then((data) => {
          // if (data.constructor.name == 'Response') {
          //     if(data.status == '404' ) {
          //         router.push({ name: "404" });
          //     }
          // }
          commit("SET_REGIONS_LIST", data.regions);
        })

        .catch((error) => {
          commit("SET_ERROR", [error.message]);
        });
    },

    getRegionCitiesList({ commit }, region_id = 0) {
      httpService
        .get("commons/get-region-cities-list/" + region_id)
        .then((data) => {
          // if (data.constructor.name == 'Response') {
          //     if(data.status == '404' ) {
          //         router.push({ name: "404" });
          //     }
          // }
          commit("SET_REGION_CITIES_LIST", data.cities);
        })

        .catch((error) => {
          commit("SET_ERROR", [error.message]);
        });
    },

    async submitApplicantProfile(context, identity) {},

    submitApplicantPortrait(protrait) {},

    submitDiverQualification(qualification) {},

    submitDiverSkill(skill) {},

    submitApplicantAddress(address) {},

    submitLicenseCardShippingAddress() {},
  },

  getters: {
    application(state) {
      return state.userApplication;
    },

    userApplications(state) {
      return state.userApplications;
    },

    applicationId(state) {
      if (!state.userApplication) {
        return null;
      }
      return state.userApplication.id;
    },

    applicationProgress(state) {
      return state.userApplication.progress;
    },

    applicantProfile(state) {
      const profile = {};
      // if(!state.userApplication || state.userApplication.applicant_profile) { return {}}

      for (let key in state.userApplication.applicant_profile) {
        if (
          state.userApplication.applicant_profile[key] == null ||
          state.userApplication.applicant_profile[key] == ""
        ) {
          continue;
        }

        profile[key] = state.userApplication.applicant_profile[key];
      }

      return profile;
    },

    diverQualifications(state) {
      if (!Array.isArray(state.userApplication.qualifications)) {
        return null;
      }
      return state.userApplication.qualifications;
    },

    applicantPortrait(state) {
      if (!state.userApplication) {
        return {};
      }
      if (!state.userApplication.applicant_portrait) {
        return { application_id: state.userApplication.id };
      }

      return state.userApplication.applicant_portrait;
    },

    getFirstStep(state) {},

    getLastStep(state) {},

    getLicensedDiveCenters(state) {
      return state.licensedDiveCenters;
    },

    getCurrentStep(state) {
      if (!state.linkedSteps) {
        return null;
      }
      if (!state.linkedSteps.current) {
        return null;
      }
      return state.linkedSteps.current.value;
    },

    getCurrentStepTitle(state) {
      if (!state.linkedSteps.current) {
        return null;
      }
      return state.linkedSteps.current.value.title;
    },

    isFirstStep(state) {
      //if(!state.linkedSteps) { return null ;}
      if (!state.linkedSteps.current) {
        return null;
      }
      return state.linkedSteps.current == state.linkedSteps.first;
    },

    isLastStep(state) {
      //if(!state.linkedSteps) { return null ;}
      if (!state.linkedSteps.current) {
        return null;
      }
      return state.linkedSteps.current == state.linkedSteps.last;
    },

    prevStep(state) {
      console.log(state);
      state.linkedSteps.prev();
    },

    nextStep(state) {
      console.log(state);
      state.linkedSteps.next();
    },

    getRegionsList(state) {
      return state.regionsList;
    },

    getRegionCitiesList(state) {
      return state.regionCitiesList;
    },
  },
};
