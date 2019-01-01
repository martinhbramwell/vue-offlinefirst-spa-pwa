const LG = console.log; // eslint-disable-line no-unused-vars, no-console

export default {
  infoTributaria: {
    ambiente: '1',
    tipoEmision: '1',
    razonSocial: 'LOGICHEM SOLUTIONS S.A',
    nombreComercial: 'Iridium Blue',
    ruc: '1792177758001',
    claveAcceso: { specialCase: 'claveAcceso' },
    codDoc: '01',
    estab: { alias: 'sucursal' },
    ptoEmi: { alias: 'pdv' },
    secuencial: { alias: 'sequential' },
    dirMatriz: '   LEO!  CUAL ES SU NUEVA DIRECCION?   ',
  },
  infoFactura: {
    fechaEmision: { alias: 'fecha' },
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
        descuentoAdicional: '0.00',
        baseImponible: { specialCase: 'baseImponible' },
        valor: { specialCase: 'valor' },
      },
    },
    propina: '0.00',
    importeTotal: { specialCase: 'pagoTotal' },
    moneda: 'moneda0',
    pagos: {
      pago: {
        formaPago: '01',
        total: { specialCase: 'pagoTotal' },
        plazo: '0',
        unidadTiempo: 'dias',
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
