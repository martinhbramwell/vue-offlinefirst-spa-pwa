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
    estab: '001',
    ptoEmi: '002',
    secuencial: { specialCase: 'sequential' },
    dirMatriz: 'PICHINCHA / QUITO / CUMBAYA / 23 DE ABRIL S13-205 Y ALFONSO LAMIÑA',
  },
  infoFactura: {
    fechaEmision: { specialCase: 'fecha' },
    dirEstablecimiento: 'PICHINCHA / QUITO / CUMBAYA / 23 DE ABRIL S13-205 Y ALFONSO LAMIÑA',
    obligadoContabilidad: 'SI',
    tipoIdentificacionComprador: { specialCase: 'tipoIdentificacionComprador' },
    razonSocialComprador: { alias: 'nombreCliente' },
    identificacionComprador: { alias: 'legalId' },


    direccionComprador: { alias: 'direccion' },

    totalSinImpuestos: { specialCase: 'baseImponible' },
    totalDescuento: '0.00',

    totalConImpuestos: {
      totalImpuesto: {
        codigo: '2',
        codigoPorcentaje: '2',
        baseImponible: { specialCase: 'baseImponible' },
        tarifa: '12',
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
      type: 'twig',
      alias: 'itemes',
      detalle: {
        codigoPrincipal: { alias: 'idItem' },

        descripcion: { alias: 'nombreProducto' },
        cantidad: { alias: 'cantidad' },
        precioUnitario: { alias: 'precio' },
        descuento: '0.00',
        precioTotalSinImpuesto: { alias: 'total' },
        impuestos: { specialCase: 'impuestos' },
      },
    },
  ],
  infoAdicional: [
    {
      type: 'attrLeaf',
      extra: 'campoAdicional',
      campoAdicional: [
        {
          attribute: { name: 'nombre', value: 'Dirección' },
          alias: 'direccion',
        },
        {
          attribute: { name: 'nombre', value: 'Teléfono' },
          specialCase: 'telefono',
        },
        {
          attribute: { name: 'nombre', value: 'Email' },
          alias: 'email',
        },
      ],
    },
  ],
};

// {
//   extra: 'telefono',
//   campoAdicional: { attribute: { nombre: '' } },
// },
// {
//   alias: 'email',
//   campoAdicional: { attribute: { nombre: 'Email' } },
// },

// LG('Factura');
// LG(factura);
