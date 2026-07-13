const clearErrors = function (formErrors) {
  for (let errorPath in formErrors) {
    delete formErrors[errorPath];
  }
};
const validateProperty = function (property, formSchema, formData, formErrors) {
  if (property in formSchema.fields) {
    formSchema
      .validateAt(property, formData)
      .then(() => {
        delete formErrors[property];
      })
      .catch((err) => {
        formErrors[property] = err.message;
      });
  }
};

export { validateProperty, clearErrors };
