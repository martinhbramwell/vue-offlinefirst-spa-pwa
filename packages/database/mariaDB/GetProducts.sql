-- DELETE FROM debug;
-- CALL debug_on('JSON_ARRAYAGG');

UPDATE tb_products SET
  product_name = "Agua IridiumbLue",
  product_description = "Agua purificada"
WHERE product_id = 1;

UPDATE tb_products SET product_name = trim(product_name);

SELECT
  CONCAT(
    JSON_OBJECT(
        "_id", concat("Product_1_", lpad(d.product_id, 16, 0))
      , "data", JSON_OBJECT(
          "idIB", d.product_id
        , "type", "product"
        , "nombre",  CONCAT("|", IFNULL(d.product_name, "FALTA"), "|")
        , "descripcion",  CONCAT("|", IFNULL(d.product_description, "FALTA"), "|")
        , "categoria",  d.product_category
        , "estado",  CONCAT("|", IFNULL(d.product_status, "FALTA"), "|")
        , "precioActual",  r.product_price
        , "precios", JSON_ARRAYAGG(
            JSON_OBJECT(
                "|tipo|",  CONCAT("|", IFNULL(r.product_price_name, "FALTA"), "|")
              , "|fecha|",  CONCAT("|", DATE_FORMAT(IFNULL(r.product_price_creation_date, NOW()), "%Y-%m-%dT%H:%i:%S.000Z"), "|")
              , "|idResponsable|",  r.product_price_creation_user_id
              , "|precio|",  r.product_price
          )
        )
      )
    ), ","
  ) as JSON
FROM
  tb_products d
    join tb_products_prices r on d.product_id = r.product_id
-- WHERE
--   product_id in (1, 16, 18)

GROUP BY d.product_id
-- -- HAVING count > 2
ORDER BY d.product_id
-- LIMIT 2
;

-- select d.product_name, d.product_description from tb_products d;
