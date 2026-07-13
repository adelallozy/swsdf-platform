import { ref, reactive } from "vue";

import StepsMaps from "@/platform/assets/applications_configs.js";

export function useApplicationsWizard() {
  // const steps = reactive(null);

  const steps = ref(null);

  const isFirst = ref(false);
  const isLast = ref(false);
  const activeStep = ref(false);
  const firstStepOrder = ref(99);
  const lastStepOrder = ref(0);
  const stepStatus = ref("REVIEW");
  const activeAction = ref("REVIEW");

  function initApplicationSteps(purpose) {
    if (!StepsMaps[purpose]) {
      return false;
    }

    steps.value = StepsMaps[purpose];

    if (steps.value.length < 1) {
      return;
    }

    activeStep.value = steps.value[0];
    firstStepOrder.value = activeStep.value.stepOrder;

    steps.value.forEach((step) => {
      if (activeStep.value.stepOrder > step.stepOrder) {
        firstStepOrder.value = step.stepOrder;
        activeStep.value = step;
      }

      if (step.stepOrder > lastStepOrder.value) {
        lastStepOrder.value = step.stepOrder;
      }
    });
  }

  function isVisibleStep(stepTitle) {
    if (!activeStep.value) {
      return false;
    }
    if (activeStep.value.title == "Application Summary") {
      return true;
    }
    return activeStep.value.title == stepTitle;
  }

  return {
    steps,
    activeStep,
    firstStepOrder,
    lastStepOrder,
    stepStatus,
    activeAction,

    initApplicationSteps,
    isVisibleStep,
  };
}
