import { pipe, string, picklist } from "valibot";

export const ATHLETE_SPORT_LABELS = {
  jetski: "Jetski",
  freediving: "Freediving",
  flyboard: "Flyboard",
  sport_fishing: "Sport Fishing",
  underwater_photography: "Underwater Photography",
  target_shooting: "Target Shooting",
  motosurf: "MotoSurf",
  powerboat_e1: "Powerboat E1",
  powerboat_f1: "Powerboat F1",
  powerboat_f2: "Powerboat F2",
  powerboat_f4: "Powerboat F4",
  powerboat_xcat: "Powerboat XCAT",
};

function humanizeSportCode(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

export function getAthleteSportCode(value) {
  if (typeof value === "string") {
    return value.trim().toLowerCase();
  }

  if (value && typeof value === "object" && typeof value.code === "string") {
    return value.code.trim().toLowerCase();
  }

  return "";
}

export function getAthleteSportLabel(value) {
  const code = getAthleteSportCode(value);
  if (!code) return "";
  return ATHLETE_SPORT_LABELS[code] || humanizeSportCode(code);
}

export const ATHLETE_SPORT_OPTIONS = [
  { label: ATHLETE_SPORT_LABELS.jetski, value: "jetski", icon: "pi-bolt" },
  {
    label: ATHLETE_SPORT_LABELS.freediving,
    value: "freediving",
    icon: "pi-wave-pulse",
  },
  { label: ATHLETE_SPORT_LABELS.flyboard, value: "flyboard", icon: "pi-send" },
  {
    label: ATHLETE_SPORT_LABELS.sport_fishing,
    value: "sport_fishing",
    icon: "pi-compass",
  },
  {
    label: ATHLETE_SPORT_LABELS.underwater_photography,
    value: "underwater_photography",
    icon: "pi-camera",
  },
  {
    label: ATHLETE_SPORT_LABELS.target_shooting,
    value: "target_shooting",
    icon: "pi-bullseye",
  },
  // Temporarily disabled in the new registration page until backend acceptance is enabled.
  // { label: ATHLETE_SPORT_LABELS.motosurf, value: 'motosurf', icon: 'pi-directions' },
  // { label: ATHLETE_SPORT_LABELS.powerboat_e1, value: 'powerboat_e1', icon: 'pi-car' },
  // { label: ATHLETE_SPORT_LABELS.powerboat_f1, value: 'powerboat_f1', icon: 'pi-car' },
  // { label: ATHLETE_SPORT_LABELS.powerboat_f2, value: 'powerboat_f2', icon: 'pi-car' },
  // { label: ATHLETE_SPORT_LABELS.powerboat_f4, value: 'powerboat_f4', icon: 'pi-car' },
  // { label: ATHLETE_SPORT_LABELS.powerboat_xcat, value: 'powerboat_xcat', icon: 'pi-car' }
];

export const ATHLETE_SPORT_VALUES = ATHLETE_SPORT_OPTIONS.map(
  (option) => option.value
);

export function makeAthleteSportSchema() {
  return {
    sport: {
      type: "radioTiles",
      label: "Sport",
      value: "",
      required: true,
      options: ATHLETE_SPORT_OPTIONS,
      attrs: {
        class: "athlete-sport-tiles",
      },
      validation: pipe(
        string("Sport is required"),
        picklist(ATHLETE_SPORT_VALUES, "Select a valid sport")
      ),
    },
  };
}

export function serializeAthleteSport(formData) {
  return {
    sport: String(formData?.sport || "").trim(),
  };
}
