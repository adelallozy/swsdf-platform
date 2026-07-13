export const getDateDetails = function (date) {
  let year = 0,
    month = 0,
    day = 0;
  if (date.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
    [year, month, day] = date.split("-");
  }

  if (date.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
    [day, month, year] = date.split("-");
  }

  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    dateString: date,
  };
};

export const createFormData = function (data) {
  const formData = new FormData();
  for (let key in data) {
    if (data[key] == null) {
      formData.append(key, "");
    } else {
      formData.append(key, data[key]);
    }
  }
  return formData;
};
export const setInputFile = function (event, formData) {
  console.log(event, formData);
  if (event.target.files.length < 1) {
    formData[event.target.name] = null;
  }
  formData[event.target.name] = event.target.files[0];
};

export default {
  getDateDetails,
  createFormData,
};
