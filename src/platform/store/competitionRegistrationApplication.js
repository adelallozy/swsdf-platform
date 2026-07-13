import { defineStore } from "pinia";

export const useApplicationStore = defineStore(
  "CompetitionRegistrationApplication",
  {
    state: () => {
      return {
        application: {},
        competition: {},
        teamLeader: {},
        teamMembers: [],
        athlete: null,
        racing_categories: [],
        isNew: true,
        canEdit: false,
        isEditing: false,
        introduction: true,
        permittedDiveCenters: [],
        target: null,
        action:
          "review" /**  review | newTeam | newMember | editTeam | editMember   **/,
      };
    },

    actions: {
      resetData() {
        this.application = null;
        this.competition = null;
        this.athlete = null;
        this.racing_categories = [];
      },
      setAction(action, member) {
        if (["newTeam", "newMember"].includes(action)) {
          this.target = {};
        }

        if (
          ![
            "review",
            "newTeam",
            "newMember",
            "editTeam",
            "editMember",
          ].includes(action)
        ) {
          this.action = "review";
          return;
        }

        this.action = action;
        this.target = member;
      },
    },
    getters: {
      saveUrl(state) {},

      canEdit(state) {},
      canApply(state) {
        return (
          ["draft", "applicant_revision"].includes(state.application.stage) &&
          state.competition.stage == "Registration"
        );
      },
      introductionView(state) {
        if (!state.competition) {
          return false;
        }
        if (!!state.application && state.application.stage !== "draft") {
          return false;
        }
        if (!!state.competition && !state.competition.terms) {
          return false;
        }
        return !!state.competition && !!state.introduction;
      },
    },
  }
);
