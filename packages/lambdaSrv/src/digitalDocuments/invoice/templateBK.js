const LG = console.log; // eslint-disable-line no-unused-vars, no-console

export default {
  infoTributaria: {
    ambiente: '1',
    tipoEmision: '1',
    razonSocial: 'LOGICHEM SOLUTIONS SOCIEDAD ANONIMA',
    nombreComercial: 'LOGICHEM SOLUTIONS',
    ruc: '1792177758001',
    claveAcceso: { specialCase: 'claveAcceso' },
    codDoc: '01',
    estab: { specialCase: 'sucursal' },
    ptoEmi: { specialCase: 'pdv' },
    secuencial: { specialCase: 'sequential' },
    dirMatriz: 'PICHINCHA / QUITO / CUMBAYA / 23 DE ABRIL S13-205 Y ALFONSO LAMIÑA',
  },
  infoFactura: {
    fechaEmision: { specialCase: 'fecha' },
    dirEstablecimiento: 'matriz',
    contribuyenteEspecial: 'contribuyente',
    obligadoContabilidad: 'SI',
    tipoIdentificacionComprador: { specialCase: 'tipoIdentificacionComprador' },
    razonSocialComprador: { alias: 'nombreCliente' },
    identificacionComprador: { alias: 'legalId' },


    direccionComprador: { alias: 'direccion' },

    totalSinImpuestos: { alias: 'subTotalConImpuesto' },
    totalDescuento: { alias: 'descuento' },

    totalConImpuestos: {
      totalImpuesto: {
        codigo: '2',
        codigoPorcentaje: '2',
        baseImponible: { specialCase: 'baseImponible' },
        valor: { specialCase: 'valor' },
      },
    },
    propina: '0.00',
    importeTotal: { specialCase: 'pagoTotal' },
    moneda: 'DOLAR',
    pagos: {
      pago: {
        formaPago: '01',
        total: { specialCase: 'pagoTotal' },
      },
    },
  },
  detalles: [
    {
      alias: 'itemes',
      detalle: {
        codigoPrincipal: { alias: 'idItem' },

        descripcion: { alias: 'nombreProducto' },
        unidadMedida: 'unidad',
        cantidad: { alias: 'cantidad' },
        precioUnitario: { alias: 'precio' },
        descuento: '0.00',
        precioTotalSinImpuesto: { alias: 'total' },
        impuestos: { specialCase: 'impuestos' },
      },
    },
  ],
};

// LG('Factura');
// LG(factura);
