import { defineStore } from "pinia";

export const useDivingCenterApplicationStore = defineStore(
  "divingCenterApplication",
  {
    state: () => {
      return {
        application: null,
        divingCenterProfile: null,
        steps: [],
        activeStep: null,
        firstStepOrder: 99,
        lastStepOrder: 0,
        stepStatus: "REVIEW",
        activeAction: "REVIEW",
        formErrors: {},
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

      clearErrors() {
        Object.keys(this.formErrors).forEach(
          (key) => delete this.formErrors[key]
        );
      },
    },
  }
);
