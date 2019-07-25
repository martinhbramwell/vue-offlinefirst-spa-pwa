const LG = console.log; // eslint-disable-line no-unused-vars, no-console

const ambiente = process.env.AMBIENTE;

const razonSocial = process.env.RAZONSOCIAL;
const nombreComercial = process.env.NOMBRECOMERCIAL;
const ruc = process.env.RUC;

const dirMatriz = process.env.DIRMATRIZ;
const dirEstablecimiento = process.env.DIRESTABLECIMIENTO;

export default {
  infoTributaria: {
    ambiente,
    tipoEmision: '1',
    razonSocial,
    nombreComercial,
    ruc,
    claveAcceso: { specialCase: 'claveAcceso' },
    codDoc: '01',
    estab: '001',
    ptoEmi: '002',
    secuencial: { specialCase: 'sequential' },
    dirMatriz,
  },
  infoFactura: {
    fechaEmision: { specialCase: 'fecha' },
    dirEstablecimiento,
    obligadoContabilidad: 'SI',
    tipoIdentificacionComprador: { specialCase: 'tipoIdentificacionComprador' },
    razonSocialComprador: { specialCase: 'nombreCliente' },
    identificacionComprador: { specialCase: 'legalId' },


    direccionComprador: { alias: 'direccion' },

    totalSinImpuestos: { specialCase: 'baseImponible' },
    totalDescuento: { alias: 'descuento' },

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

        descripcion: { specialCase: 'nombreProducto' },
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
