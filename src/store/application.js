import { defineStore } from "pinia";
import ApiService from "@/core/services/ApiService";

const addNewApplicantProfileURL = "applications/add-applicant-profile/";
const updateApplicantProfileURL = "applications/update-applicant-profile/";
const LICENSED_DIVE_CENTERS_URL = import.meta.env.VITE_LICENSED_DIVE_CENTERS;

export const useApplicationStore = defineStore("application", {
  state: () => {
    return {
      application: null,
      applications: null,
      applicantProfile: null,
      applicantPortrait: null,
      qualifications: null,
      workContracts: null,
      licenseCard: null,
      athleteParticipation: null,
      athlete_participation: null,
      licensedDiveCenters: [],
      isLoading: false,
      isPosting: false,
      hasErrors: false,
      isWorking: false,
      formErrors: [],
      errors: [],

      expectedAction: {
        action: "REVIEW", // "ADD NEW" , "UPDATE"
        target: "Application",
        target_id: 0,
        postURL: "",
      },

      steps: [],
      activeStep: null,

      firstStepOrder: 99,
      lastStepOrder: 0,
      activeAction: "REVIEW", // 'EDIT'
      stepStatus: "REVIEW", // "ADD NEW" , "UPDATE"
    };
  },
  actions: {
    initSteps(steps) {
      this.steps = steps;
      if (steps.length < 1) {
        return;
      }

      this.activeStep = steps[0];
      this.firstStepOrder = this.activeStep.stepOrder;

      steps.forEach((step) => {
        if (this.activeStep.stepOrder > step.stepOrder) {
          this.firstStepOrder = step.stepOrder;
          this.activeStep = step;
        }

        if (step.stepOrder > this.lastStepOrder) {
          this.lastStepOrder = step.stepOrder;
        }
      });
    },

    nextStep() {
      if (this.activeStep.stepOrder >= this.lastStepOrder) {
        return;
      }

      const stepOrder = this.activeStep.stepOrder + 1;
      this.activeStep = this.steps.find((current) => {
        return stepOrder == current.stepOrder;
      });
    },

    prevStep() {
      if (this.activeStep.stepOrder <= 1) {
        return;
      }

      const stepOrder = this.activeStep.stepOrder - 1;
      this.activeStep = this.steps.find((current) => {
        return stepOrder == current.stepOrder;
      });
    },

    moveTo(stepTitle) {
      if (stepTitle == this.activeStep.title) {
        return true;
      }

      this.steps.forEach((step) => {
        if (stepTitle == step.title) {
          this.activeStep = step;
        }
      });

      this.activeAction = "REVIEW";
    },
    fetchDiveCentersList() {
      ApiService.get(LICENSED_DIVE_CENTERS_URL)
        .then((response) => {
          if (response.data.diveCenters != undefined) {
            this.licensedDiveCenters = response.data.diveCenters;
          }
        })
        .catch((error) => {})
        .finally(() => {});
    },

    clearErrors() {
      Object.keys(this.formErrors).forEach(
        (key) => delete this.formErrors[key]
      );
    },

    setExpectedAction(stepTitle = "Applicant Profile", action = "Review") {
      if (
        null == this.application ||
        undefined == this.application.applicant_permission
      ) {
        this.expectedAction.action = "UNKNOWN";
        this.expectedAction.target = "UNKNOWN";

        return false;
      } else if ("Edit" != this.application.applicant_permission) {
        this.expectedAction.action = "REVIEW";
        this.expectedAction.target = "Application";
      } else if (
        "Applicant Profile" == stepTitle &&
        null != this.applicantProfile &&
        action == "UPDATE"
      ) {
        this.expectedAction.action = "UPDATE";
        this.expectedAction.target = "Applicant Profile";
        this.expectedAction.target_id = parseInt(
          this.expectedAction.applicantProfile.id
        );
        this.expectedAction.postURL =
          updateApplicantProfileURL + this.expectedAction.applicantProfile.id;
        return true;
      }

      if ("Applicant Profile" == stepTitle && null == this.applicantProfile) {
        this.expectedAction.action = "ADD NEW";
        this.expectedAction.target = "Applicant Profile";
        this.expectedAction.target_id = 0;
        // this.expectedAction.postURL = updateApplicantProfileURL +this.expectedAction.applicantProfile.id ;
        this.expectedAction.postURL =
          addNewApplicantProfileURL + this.application.id;
        return true;
      }

      if ("Applicant Profile" == stepTitle && null != this.applicantProfile) {
        this.expectedAction.action = "REVIEW";
        this.expectedAction.target = "applicantProfile";
        this.expectedAction.target_id = applicantProfile.id;
        return true;
      }
    },
  },

  getters: {
    canEdit(state) {
      if (state.application == null || typeof state.application == undefined) {
        return false;
      }
      return this.application.user_prmissions;
    },

    applicantProfileSubmitAction(state) {
      if (
        state.applicantProfile == null ||
        typeof state.applicantProfile == undefined
      ) {
        return "UPDATE";
      }

      if (
        state.applicantProfile.id == null ||
        typeof state.applicantProfile.id == undefined
      ) {
        return "UPDATE";
      }

      return "ADD NEW";
    },

    canRegisterContract(state) {
      if (state.workContracts == null || state.workContracts == undefined) {
        return true;
      }

      const result = state.workContracts.reduce((count, contract) => {
        if ("Remove" == contract.purpose) {
          return count;
        }
        return ++count;
      }, 0);

      return result < 3;
    },

    registrationWorkContracts(state) {
      if (state.workContracts == null || state.workContracts == undefined) {
        return [];
      }
      const contracts = state.workContracts.filter((contract) => {
        return ["Registration", "Review"].includes(contract.purpose);
      });
      return contracts;
    },

    removedWorkContracts(state) {
      if (state.workContracts == null || state.workContracts == undefined) {
        return [];
      }
      const contracts = state.workContracts.filter((contract) => {
        return "Remove" == contract.purpose;
      });
      return contracts;
    },
    removedWorkContractsCount(state) {
      if (state.workContracts == null || state.workContracts == undefined) {
        return 0;
      }

      const result = state.workContracts.reduce((count, contract) => {
        if ("Remove" == contract.purpose) {
          return ++count;
        }
        return count;
      }, 0);

      return result;
    },
  },
});
