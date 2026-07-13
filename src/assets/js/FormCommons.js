const dateFormat = function (date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const setInputFile = function (event) {
  if (event.target.files.length < 1) {
    formData[event.target.name] = null;
  }
  formData[event.target.name] = event.target.files[0];
};

export { dateFormat };
