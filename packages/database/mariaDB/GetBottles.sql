-- DELETE FROM debug;
-- CALL debug_on('JSON_ARRAYAGG');


SELECT DISTINCT
    CONCAT(
      JSON_OBJECT(
          "_id", concat("aBottle_1_", lpad(e.envases_id, 16, 0))
        , "data", JSON_OBJECT(
            "idIB", e.envases_id
          , "codigo", IFNULL(e.cod, "FALTA")
          , "type", "bottle"
          , "fechaCompra", IFNULL(e.date_purchase, NOW())
          , "ubicacion", IFNULL(e.location, "FALTA")
          , "ultimo", IFNULL(e.last_partner_id, 0)
          , "movements", IFNULL(e.envases_id, 0)
          , "deliveries", IFNULL(e.delivery_quantity, 0)
          , "returns", IFNULL(e.receptions_quantity, 0)
          , "client_id", IFNULL(e.client_id, 0)
          , "property_client", IF(IFNULL(e.property_client, "no") != "N", "si", "no")
          , "property_ib", IF(IFNULL(e.property_ib, "no") != "N", "si", "no")
        )
      ), ","
    )
FROM
  tb_envases e LEFT JOIN tb_partners p ON p.partner_id = e.last_partner_id
WHERE
  IFNULL(e.receptions_quantity, 0) > 20
;

-- GROUP BY p.partner_id
-- LIMIT 2;

-- SELECT * FROM debug;
-- CALL debug_off('JSON_ARRAYAGG');




-- DESCRIBE tb_partners;
-- DESCRIBE tb_envases;

/*
{
  "_id": "aBottle_1_0000000000100001",
  "data": {
    "idIB": "100001",
    "codigo": "IBAA001",
    "type": "bottle",
    "fechaCompra": "2014-09-01",
    "ubicacion": "planta",
    "movements": [],
    "ultimo": "12345"
  }
}
*/

-- SELECT
--     CONCAT(
--       '          , "'
--     , column_name
--     , '", IFNULL(e.'
--     , column_name
--     , ', '
--     , IF(
--         DATA_TYPE = 'int'
--           , '0'
--               , IF(
--                   DATA_TYPE = 'datetime'
--                     , 'NOW()'
--                     , '"FALTA"'
--                 )
--       )
--     , ')'
--   )
--   -- , DATA_TYPE
-- FROM
--   information_schema.columns
-- WHERE
--       table_schema = 'ib2018'
--   AND table_name = 'tb_envases'
-- ORDER BY ordinal_position DESC
-- ;
