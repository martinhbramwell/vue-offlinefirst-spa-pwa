-- DELETE FROM debug;
-- CALL debug_on('JSON_ARRAYAGG');


SELECT DISTINCT
  -- v.envases_id, s.direction, JSON_ARRAYAGG(IFNULL(s.movement, 0))
  -- *
  -- count(*)
    CONCAT(
      JSON_OBJECT(
          "_id", concat("aBottle_1_", lpad(v.envases_id, 16, 0))
        , "data", JSON_OBJECT(
            "idIB", v.envases_id
          , "codigo", IFNULL(v.cod, "FALTA")
          , "type", "bottle"
          , "fechaCompra", IFNULL(v.date_purchase, NOW())
          , "ubicacion", IFNULL(v.location, "FALTA")
          , "ultimo", IFNULL(v.last_partner_id, 0)
          , "movements", v.envases_id
          , "deliveries", IFNULL(v.delivery_quantity, 0)
          , "returns", IFNULL(v.receptions_quantity, 0)
          , "client_id", IFNULL(v.client_id, 0)
          , "property_client", IF(IFNULL(v.property_client, "no") != "N", "si", "no")
          , "property_ib", IF(IFNULL(v.property_ib, "no") != "N", "si", "no")
        )
      ), ","
    )
FROM
  tb_envases v
    JOIN tb_partners p ON p.partner_id = v.last_partner_id
    JOIN short_list s ON
          s.partner = v.last_partner_id
      AND s.partner = p.partner_id
      AND v.envases_id = s.envase_id
WHERE
      p.partner_id in (select distinct partner from short_list where envase_id < 600)
  and v.envases_id in  (select distinct envase_id from short_list where envase_id < 600)
  and s.envase_id < 600
GROUP BY v.envases_id
;

--     envases_id IN (
--       778, 1251, 501, 1460, 1475, 453, 1451, 1559, 408, 518, 519, 925, 1102
--     , 731, 1160, 709, 1245, 651, 575, 1640, 1711, 2480, 63, 2839, 2701, 2692
--     , 2863, 2907, 2164, 2849, 206, 1737, 330, 723, 23, 1867, 293, 284
--  )
--   -- and (e.receptions_quantity = 3 or e.last_partner_id in (1))
-- ;

-- SELECT DISTINCT
--     CONCAT(
--       JSON_OBJECT(
--           "_id", concat("aBottle_1_", lpad(e.envases_id, 16, 0))
--         , "data", JSON_OBJECT(
--             "idIB", e.envases_id
--           , "codigo", IFNULL(e.cod, "FALTA")
--           , "type", "bottle"
--           , "fechaCompra", IFNULL(e.date_purchase, NOW())
--           , "ubicacion", IFNULL(e.location, "FALTA")
--           , "ultimo", IFNULL(e.last_partner_id, 0)
--           , "movements", IFNULL(e.envases_id, 0)
--           , "deliveries", IFNULL(e.delivery_quantity, 0)
--           , "returns", IFNULL(e.receptions_quantity, 0)
--           , "client_id", IFNULL(e.client_id, 0)
--           , "property_client", IF(IFNULL(e.property_client, "no") != "N", "si", "no")
--           , "property_ib", IF(IFNULL(e.property_ib, "no") != "N", "si", "no")
--         )
--       ), ","
--     )
-- FROM
--   tb_envases e LEFT JOIN tb_partners p ON p.partner_id = e.last_partner_id
-- WHERE
--     envases_id IN (
--       778, 1251, 501, 1460, 1475, 453, 1451, 1559, 408, 518, 519, 925, 1102
--     , 731, 1160, 709, 1245, 651, 575, 1640, 1711, 2480, 63, 2839, 2701, 2692
--     , 2863, 2907, 2164, 2849, 206, 1737, 330, 723, 23, 1867, 293, 284
--  )
--   -- and (e.receptions_quantity = 3 or e.last_partner_id in (1))
-- ;

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
