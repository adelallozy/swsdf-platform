import { ref, reactive } from "vue";
import axios from "axios";

const APPLICANT_EDITABLE_STAGES = ["draft", "applicant_revision"];

export function useApplicationStore() {
  // Application state
  const application = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const isModified = ref(false);

  // Application-specific data based on type
  const applicationData = reactive({
    userProfile: null,
    userPhoto: null,
    diverMemberships: [],
    workContracts: [],
    applicationFiles: [],
    athleteMembership: null,
    eventParticipation: null,
    divingCenter: null,
    centerMemberships: [],
  });

  // Loading states for different entities
  const entityLoading = reactive({
    userProfile: false,
    userPhoto: false,
    diverMemberships: false,
    workContracts: false,
    applicationFiles: false,
    athleteMembership: false,
    eventParticipation: false,
    divingCenter: false,
    centerMemberships: false,
  });

  // Application type detection
  const getApplicationType = () => {
    if (!application.value) return null;
    return application.value.purpose || application.value.type || "generic";
  };

  // Load base application data
  const loadApplication = async (id) => {
    if (!id) return;

    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get(`/api/applications/${id}`);
      application.value = response.data;

      // Clear existing data when loading new application
      Object.keys(applicationData).forEach((key) => {
        applicationData[key] = null;
      });

      isModified.value = false;
      return response.data;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Load specific related entities based on application type
  const loadApplicationEntities = async (applicationId, entityType) => {
    if (!applicationId) return;

    const type = getApplicationType();
    entityLoading[entityType] = true;

    try {
      let response;

      switch (entityType) {
        case "userProfile":
          if (type === "professional-diver-new-license") {
            response = await axios.get(
              `/api/applications/${applicationId}/user-profile`
            );
            applicationData.userProfile = response.data;
          }
          break;

        case "userPhoto":
          if (type === "professional-diver-new-license") {
            response = await axios.get(
              `/api/applications/${applicationId}/user-photo`
            );
            applicationData.userPhoto = response.data;
          }
          break;

        case "diverMemberships":
          if (type === "professional-diver-new-license") {
            response = await axios.get(
              `/api/applications/${applicationId}/diver-memberships`
            );
            applicationData.diverMemberships = response.data;
          }
          break;

        case "workContracts":
          if (type === "professional-diver-new-license") {
            response = await axios.get(
              `/api/applications/${applicationId}/work-contracts`
            );
            applicationData.workContracts = response.data;
          }
          break;

        case "applicationFiles":
          response = await axios.get(
            `/api/applications/${applicationId}/files`
          );
          applicationData.applicationFiles = response.data;
          break;

        case "athleteMembership":
          if (type === "athlete-new-registration") {
            response = await axios.get(
              `/api/applications/${applicationId}/athlete-membership`
            );
            applicationData.athleteMembership = response.data;
          }
          break;

        case "eventParticipation":
          if (type === "event-participation") {
            response = await axios.get(
              `/api/applications/${applicationId}/event-participation`
            );
            applicationData.eventParticipation = response.data;
          }
          break;

        case "divingCenter":
          if (type === "diving-center-new-membership") {
            response = await axios.get(
              `/api/applications/${applicationId}/diving-center`
            );
            applicationData.divingCenter = response.data;
          }
          break;

        case "centerMemberships":
          if (type === "diving-center-new-membership") {
            response = await axios.get(
              `/api/applications/${applicationId}/center-memberships`
            );
            applicationData.centerMemberships = response.data;
          }
          break;
      }

      return response?.data;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      entityLoading[entityType] = false;
    }
  };

  // Check if application can be modified
  const canModifyApplication = () => {
    return APPLICANT_EDITABLE_STAGES.includes(application.value?.stage);
  };

  // Generic update method for any entity with protection
  const updateApplicationEntity = async (entityType, entityId, updates) => {
    if (!application.value?.id) return;

    // Check if modification is allowed
    if (!canModifyApplication()) {
      throw new Error("Cannot modify application in the current stage");
    }

    try {
      let response;
      const type = getApplicationType();

      switch (entityType) {
        case "userProfile":
          if (type === "professional-diver-new-license") {
            response = await axios.put(
              `/api/applications/${application.value.id}/user-profile`,
              updates
            );
            applicationData.userProfile = response.data;
          }
          break;

        case "userPhoto":
          if (type === "professional-diver-new-license") {
            const formData = new FormData();
            formData.append("photo", updates.photo);
            response = await axios.post(
              `/api/applications/${application.value.id}/user-photo`,
              formData
            );
            applicationData.userPhoto = response.data;
          }
          break;

        case "diverMembership":
          if (type === "professional-diver-new-license") {
            response = await axios.put(
              `/api/applications/${application.value.id}/diver-memberships/${entityId}`,
              updates
            );
            const index = applicationData.diverMemberships.findIndex(
              (m) => m.id === entityId
            );
            if (index !== -1) {
              applicationData.diverMemberships[index] = response.data;
            }
          }
          break;

        case "workContract":
          if (type === "professional-diver-new-license") {
            response = await axios.put(
              `/api/applications/${application.value.id}/work-contracts/${entityId}`,
              updates
            );
            const index = applicationData.workContracts.findIndex(
              (c) => c.id === entityId
            );
            if (index !== -1) {
              applicationData.workContracts[index] = response.data;
            }
          }
          break;

        case "file":
          response = await axios.put(
            `/api/applications/${application.value.id}/files/${entityId}`,
            updates
          );
          const index = applicationData.applicationFiles.findIndex(
            (f) => f.id === entityId
          );
          if (index !== -1) {
            applicationData.applicationFiles[index] = response.data;
          }
          break;

        default:
          throw new Error(`Unsupported entity type: ${entityType}`);
      }

      isModified.value = true;
      return response?.data;
    } catch (err) {
      error.value = err;
      throw err;
    }
  };

  // File management methods with protection
  const addApplicationFile = async (fileData, type = "general") => {
    if (!application.value?.id) return;

    // Check if modification is allowed
    if (!canModifyApplication()) {
      throw new Error("Cannot modify application in the current stage");
    }

    try {
      const formData = new FormData();
      formData.append("file", fileData);
      formData.append("type", type);

      const response = await axios.post(
        `/api/applications/${application.value.id}/files`,
        formData
      );

      // Add to application files
      if (Array.isArray(applicationData.applicationFiles)) {
        applicationData.applicationFiles.push(response.data);
      } else {
        applicationData.applicationFiles = [response.data];
      }

      isModified.value = true;
      return response.data;
    } catch (err) {
      error.value = err;
      throw err;
    }
  };

  const removeApplicationFile = async (fileId) => {
    if (!application.value?.id || !fileId) return;

    // Check if modification is allowed
    if (!canModifyApplication()) {
      throw new Error("Cannot modify application in the current stage");
    }

    try {
      await axios.delete(
        `/api/applications/${application.value.id}/files/${fileId}`
      );

      // Remove from application files
      if (Array.isArray(applicationData.applicationFiles)) {
        applicationData.applicationFiles =
          applicationData.applicationFiles.filter((f) => f.id !== fileId);
      }

      isModified.value = true;
    } catch (err) {
      error.value = err;
      throw err;
    }
  };

  // Getters for different entity types
  const getApplicationEntities = () => {
    const type = getApplicationType();

    switch (type) {
      case "professional-diver-new-license":
        return {
          userProfile: applicationData.userProfile,
          userPhoto: applicationData.userPhoto,
          memberships: applicationData.diverMemberships,
          contracts: applicationData.workContracts,
          files: applicationData.applicationFiles,
        };

      case "diving-center-new-membership":
        return {
          divingCenter: applicationData.divingCenter,
          memberships: applicationData.centerMemberships,
          files: applicationData.applicationFiles,
        };

      case "athlete-new-registration":
        return {
          athleteMembership: applicationData.athleteMembership,
          files: applicationData.applicationFiles,
        };

      case "event-participation":
        return {
          eventParticipation: applicationData.eventParticipation,
          files: applicationData.applicationFiles,
        };

      default:
        return {
          files: applicationData.applicationFiles,
        };
    }
  };

  // Type checking methods
  const isProfessionalDiverApplication = () =>
    getApplicationType() === "professional-diver-new-license";
  const isDivingCenterApplication = () =>
    getApplicationType() === "diving-center-new-membership";
  const isAthleteApplication = () =>
    getApplicationType() === "athlete-new-registration";
  const isEventApplication = () =>
    getApplicationType() === "event-participation";

  return {
    // Reactive state
    application,
    loading,
    error,
    isModified,

    // Entity loading states
    entityLoading,

    // Methods
    loadApplication,
    loadApplicationEntities,
    updateApplicationEntity,
    addApplicationFile,
    removeApplicationFile,
    canModifyApplication,

    // Getters
    getApplicationType,
    getApplicationEntities,

    // Type checking
    isProfessionalDiverApplication,
    isDivingCenterApplication,
    isAthleteApplication,
    isEventApplication,

    // Direct access to entities (for components that need them)
    userProfile: () => applicationData.userProfile,
    userPhoto: () => applicationData.userPhoto,
    diverMemberships: () => applicationData.diverMemberships,
    workContracts: () => applicationData.workContracts,
    applicationFiles: () => applicationData.applicationFiles,
    athleteMembership: () => applicationData.athleteMembership,
    eventParticipation: () => applicationData.eventParticipation,
    divingCenter: () => applicationData.divingCenter,
    centerMemberships: () => applicationData.centerMemberships,
  };
}
