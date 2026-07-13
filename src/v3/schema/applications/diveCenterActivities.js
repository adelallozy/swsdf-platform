import { custom } from "valibot";

const TRAINING_ACTIVITY_VALUES = new Set([
  "FREEDIVING_TRAINING",
  "RECREATIONAL_DIVING_TRAINING",
  "TECHNICAL_DIVING_TRAINING",
]);

const PRIMARY_ACTIVITY_KEYS = [
  "ISSUING_DIVING_PERMITS",
  "FREEDIVING_TRAINING",
  "RECREATIONAL_DIVING_TRAINING",
  "TECHNICAL_DIVING_TRAINING",
];

const ANCILLARY_ACTIVITY_KEYS = [
  "EQUIPMENT_SELLING",
  "EQUIPMENT_RENTAL",
  "FREEDIVING_EQUIPMENT_RENTAL",
  "RECREATIONAL_DIVING_EQUIPMENT_RENTAL",
  "TECHNICAL_DIVING_EQUIPMENT_RENTAL",
  "EQUIPMENT_MAINTENANCE",
  "ORGANIZING_DIVING_TRIPS",
  "DIVING_COURSES_MATERIALS_SELLING",
  "FIRST_AID_TRAINING",
  "FIRST_AID_COURSES_EQUIPMENTS_SELLING",
  "AIR_FILLING",
  "ENHANCED_AIR_FILLING",
  "TRI_MIX_GASES_FILLING",
];

function uniqueStringArray(values = []) {
  return Array.from(
    new Set(
      values
        .filter((value) => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

function buildActivityOptions(rawOptions = []) {
  return rawOptions
    .filter(
      (option) =>
        option &&
        typeof option.value === "string" &&
        option.value.trim().length > 0
    )
    .map((option) => ({
      label: option.value.trim(),
      value: option.value.trim(),
    }))
    .filter(
      (option, index, array) =>
        array.findIndex((item) => item.value === option.value) === index
    );
}

export function extractDiveCenterActivityGroups(response = {}) {
  return {
    primaryOptions: buildActivityOptions(response.divingPrimaryActivityOptions),
    ancillaryOptions: buildActivityOptions(
      response.divingAncillaryActivityOptions
    ),
  };
}

export function getDefaultDiveCenterActivityGroups() {
  return {
    primaryOptions: PRIMARY_ACTIVITY_KEYS.map((value) => ({
      label: value,
      value,
    })),
    ancillaryOptions: ANCILLARY_ACTIVITY_KEYS.map((value) => ({
      label: value,
      value,
    })),
  };
}

export function partitionDiveCenterActivities(
  divingActivities = [],
  activityGroups = {}
) {
  const selectedActivities = uniqueStringArray(divingActivities);
  const primaryValues = new Set(
    (activityGroups.primaryOptions || []).map((option) => option.value)
  );
  const ancillaryValues = new Set(
    (activityGroups.ancillaryOptions || []).map((option) => option.value)
  );

  const primaryActivities = [];
  const ancillaryActivities = [];
  const unclassifiedActivities = [];

  selectedActivities.forEach((activity) => {
    if (primaryValues.has(activity)) {
      primaryActivities.push(activity);
      return;
    }

    if (ancillaryValues.has(activity)) {
      ancillaryActivities.push(activity);
      return;
    }

    unclassifiedActivities.push(activity);
  });

  return {
    primaryActivities,
    ancillaryActivities,
    unclassifiedActivities,
  };
}

export function requiresDiveCenterInternationalMembership(divingActivities = []) {
  return uniqueStringArray(divingActivities).some((activity) =>
    TRAINING_ACTIVITY_VALUES.has(activity)
  );
}

export function makeDiveCenterActivitiesSchema() {
  return {
    primary_diving_activities: {
      type: "radioTiles",
      label: "Main Diving Activities",
      value: [],
      options: [],
      validation: custom(
        (value) => Array.isArray(value) && value.length > 0,
        "At least one main diving activity is required"
      ),
      attrs: {
        multiple: true,
      },
      required: true,
    },

    ancillary_diving_activities: {
      type: "radioTiles",
      label: "Ancillary Diving Activities",
      value: [],
      options: [],
      validation: custom(
        (value) => Array.isArray(value) && value.length > 0,
        "At least one ancillary diving activity is required"
      ),
      attrs: {
        multiple: true,
      },
      required: true,
    },
  };
}

export function getDiveCenterActivitiesInitialValues(
  divingActivities = [],
  activityGroups = {}
) {
  const {
    primaryActivities,
    ancillaryActivities,
    unclassifiedActivities,
  } = partitionDiveCenterActivities(divingActivities, activityGroups);

  return {
    formData: {
      primary_diving_activities: primaryActivities,
      ancillary_diving_activities: ancillaryActivities,
    },
    unclassifiedActivities,
  };
}

export function serializeDiveCenterActivities(data = {}) {
  return {
    diving_activities: uniqueStringArray([
      ...(Array.isArray(data.primary_diving_activities)
        ? data.primary_diving_activities
        : []),
      ...(Array.isArray(data.ancillary_diving_activities)
        ? data.ancillary_diving_activities
        : []),
    ]),
  };
}
