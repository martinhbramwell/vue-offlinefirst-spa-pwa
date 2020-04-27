{
  "views": {
    "addressExport": {
      "map": "function (doc) {
        if (doc.data.type
          && doc.data.type === 'person'
          && doc.data.direccion
          && doc.data.idib >= 790
        ) {
          emit(
            doc.data.idib,
            '(  \"' +
            doc.data.nombre + ' (' + doc.data.idib + ') Oficina\"' +
            ', \"' + doc.data.nombre + '\",     \"' +
            doc.data.direccion +
            '\", \"FALTA\", \"FALTA\", \"FALTA\", \"Ecuador\", \"' +
            doc.data.telefono_1 + '\", \"' +
            doc.data.email +
            '\", \"Oficina\"' +
            '  ),'
          )
        }
      }"
   },
    "addressLinkExport": {
      "map": "function (doc) {
        if (doc.data.type
          && doc.data.type === 'person'
          && doc.data.direccion
          && doc.data.idib >= 790
        ) {
          emit(
            doc.data.idib,
            '(  \"primaryKeyPlaceHolder|' + doc.data.nombre + doc.data.idib + '|\", \"' +
            doc.data.nombre + ' (' + doc.data.idib + ') Office\"' +
            ', \"links\", \"Address\", 1, \"Customer\"' +
            ', \"' + doc.data.nombre + '\", \"' + doc.data.nombre +
            '\"  ),'
          )
        }
      }"
   },
    "personExport": {
      "map": "function (doc) {
        if (doc.data.type
          && doc.data.type === 'person'
          && doc.data.idib >= 790
        ) {
          var isNaked = doc.data.ruc_cedula.indexOf(\"[\");
          var ruc_cedula = doc.data.ruc_cedula;
          if ( isNaked < 0 )  { ruc_cedula = '[' + doc.data.ruc_cedula + ']'; }
          emit(
            doc.data.idib,
            '( \"' +
            'IB_' + doc.data.idib +
            '\", \"' +
            doc.data.nombre +
            '\", \"Company\", \"All Customer Groups\", \"All Territories\", \"' +
            ruc_cedula + '\" ),'
            /* ruc_cedula + '\", \"' + '\", \"' + '\", \"' + '\", \"' +
            '\", \"\\'9ab7333f97\\'\",\"Marcelo Arias\",\"100\"' */
          )
        }
      }"
    }
  },
  "language": "javascript"
}
