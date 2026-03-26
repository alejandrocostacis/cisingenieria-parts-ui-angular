angular.module("messages", [])
  .constant("MESSAGES", {
    loginFailed: 'No se ha podido iniciar session, compruebe nombre de usuario y contraseña',
    somethingHapped: "Ops! Algo ha ocurrido.",
    imposibleToSave: "No se ha podido guardar",
    imposibleToRemove: 'No se ha podido eliminar',
    imposibleToFetch: 'No se ha podido obtener la lista de ',
    imposibleToFetchOne: 'No se ha podido obtener el ',
    imposibleToChangePassword: 'No se ha podido cambiar la contraseña',
    imposibbleToResetPassword: 'No se ha podido restaurar la contraseña',
    removedSuccessfuly: 'Se ha eliminado correctamente',
    savedSuccessfuly: 'Se ha guardado correctamente',
    passwordChangedSuccessfuly: 'La contraseña se ha cambiado correctamente',
    passwordResetSucessfuly: 'La contraseña se ha restaurado correctamente',
    areYouSureToRemove: "¿Está seguro que desea eliminar definitivamente?",
    areYouSureToSave: '¿Está seguro que desea guardar los cambios?',
    areYouSureToResetPassword: '¿Está seguro que desea restaurar la contraseña?',
    yes: 'Si',
    no: 'No'
  });
