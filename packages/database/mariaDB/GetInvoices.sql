-- DELETE FROM debug;
-- CALL debug_on('JSON_ARRAYAGG');


SELECT
  CONCAT(
    JSON_OBJECT(
        "_id", concat("Invoice_1_", lpad(i.invoice_id, 16, 0))
      , "data", JSON_OBJECT(
          "idib", i.invoice_id
        , "type", "invoice"
        , "codigo", i.invoice_number
        , "fecha",  i.invoice_creation_date
        , "idCliente",  i.partner_id
        , "nombreCliente",  p.partner_name
        , "idResponsable",  i.invoice_user_id
        , "nombreResponsable",  q.partner_name
        , "estado",  i.invoice_status
        , "subTotalConImpuesto",  i.invoice_subtotal_tax_amount
        , "subTotalSinImpuesto",  i.invoice_subtotal_iva_cero_amount
        , "subTotal",  i.invoice_subtotal_amount
        , "totalImpuesto",  i.invoice_iva_total_amount
        , "total",  i.invoice_total_amount
        , "descuento",  i.invoice_discount
        , "notas",  IFNULL(i.invoice_notes, "")
        , "count",  count(l.invoice_line_id)
        , "itemes", JSON_ARRAYAGG(
            JSON_OBJECT(
                "|idItem|",  l.invoice_line_id
              , "|idProducto|",  l.product_id
              , "|nombreProducto|",  CONCAT("|", IFNULL(d.product_name, "FALTA"), "|")
              , "|cantidad|",  l.invoice_line_product_quantity
              , "|descuento|",  l.invoice_line_descount
              , "|precio|",  l.invoice_line_untitary_price_amount
              , "|total|",  l.invoice_line_total_amount
              , "|impuesto|",  l.invoice_line_tax_total_amount
          )
        )
      )
    ), ","
  ) as JSON

  --   i.invoice_id as id
  -- , i.invoice_number as codigo
  -- , count(*) as count
FROM
  tb_invoices i
    JOIN tb_invoices_lines l ON i.invoice_id = l.invoice_id
    JOIN tb_partners p ON i.partner_id = p.partner_id
    JOIN tb_partners q ON i.invoice_user_id = q.partner_id
    JOIN tb_products d ON l.product_id = d.product_id
-- WHERE
--   i.invoice_id in (131, 132, 133, 134)
--   i.invoice_id in (3561, 3562, 3587, 3603, 3612, 3613)
GROUP BY i.invoice_id
-- HAVING count > 2
ORDER BY i.invoice_id
-- limit 2
;

