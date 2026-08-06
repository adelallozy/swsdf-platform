export const APPLICATION_STAGES = Object.freeze({
  DRAFT: "draft",
  APPLICANT_REVISION: "applicant_revision",
  REVIEW: "review",
});

export function isApplicantEditableStage(stage) {
  return (
    stage === APPLICATION_STAGES.DRAFT ||
    stage === APPLICATION_STAGES.APPLICANT_REVISION
  );
}

export function isApplicantDraftStage(stage) {
  return stage === APPLICATION_STAGES.DRAFT;
}

export function isApplicantRevisionStage(stage) {
  return stage === APPLICATION_STAGES.APPLICANT_REVISION;
}

export function isReviewStage(stage) {
  return stage === APPLICATION_STAGES.REVIEW;
}

export function getConflictApplication(error) {
  return error?.payload?.application || error?.payload?.body?.application || null;
}

export function getConflictApplicationId(error) {
  return (
    getConflictApplication(error)?.id ||
    error?.payload?.application_id ||
    error?.payload?.body?.application_id ||
    null
  );
}

export function getConflictApplicationNotice(error) {
  const application = getConflictApplication(error);

  if (!application) {
    return "You already have an active application. You can track it from your applications.";
  }

  if (isApplicantEditableStage(application.stage)) {
    return "You already have an application in progress. Continue the existing application instead.";
  }

  return "You already submitted this application. You can track its status here.";
}
