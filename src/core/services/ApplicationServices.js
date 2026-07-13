import ApiService from "@/core/services/ApiService";

const deleteUrl = import.meta.env.VITE_DELETE_APPLICATION;

function createFormData(data) {
  const formData = new FormData();
  for (let key in data) {
    if (data[key] == null) {
      formData.append(key, "");
    } else {
      formData.append(key, data[key]);
    }
  }
  return formData;
}

export const removeApplication = function (id) {
  return ApiService.delete(`${deleteUrl}/${id}`);
};

export default {
  removeApplication,
};
