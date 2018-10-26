-- -- DELETE FROM debug;
-- -- CALL debug_on('JSON_ARRAYAGG');


SELECT
    CONCAT(
      JSON_OBJECT(
          "_id", concat("Movement_2_", CONCAT(
                DATE_FORMAT(IFNULL(e.date_entrega, NOW()), "%Y%m%d%H%i%S")
              , "O"
              , LPAD(CAST(IFNULL(e.partner_id, 0) as CHAR(5)), 5, "0")
            ))
        , "data", JSON_OBJECT(
            "id", CONCAT(
                  DATE_FORMAT(IFNULL(e.date_entrega, NOW()), "%Y%m%d%H%i%S")
                , "O"
                , LPAD(CAST(IFNULL(e.partner_id, 0) as CHAR(5)), 5, "0")
              )
          , "inOut", "out"
          , "type", "movement"
          , "status", "new"
          , "bottles", JSON_ARRAYAGG(IFNULL(v.envases_id, 0))
          , "customer", IFNULL(e.partner_id, 0)
          , "inventory", 1
          -- , "ent_canceled", IFNULL(e.ent_canceled, "FALTA")
          , "invoiced", IFNULL(e.invoiced, 0)
          , "notes", IFNULL(e.notes, "")
          , "bottles_quantity", IFNULL(e.bottles_quantity, 0)
          , "invoice_nr", IFNULL(e.invoice_nr, 0)
          , "entrega_responsable", IFNULL(e.user_id, 0)
          , "entrega_id", IFNULL(e.entrega_id, 0)
        )
      ), ","
    )
FROM
  tb_entregas e
    JOIN tb_entregas_lines l ON l.entrega_id = e.entrega_id
    JOIN tb_envases v ON v.cod = l.cod
WHERE
      e.partner_id in (
     select distinct partner
       from short_list
      where envase_id < 600
        and direction = "O"
        and partner != 1
    )
  and v.envases_id in (
     select distinct envase_id
       from short_list
      where envase_id < 600
        and direction = "O"
        and partner != 1
    )
  and e.entrega_id in  (
     select distinct movement
       from short_list
      where envase_id < 600
        and direction = "O"
        and partner != 1
    )
GROUP BY e.entrega_id
ORDER BY e.partner_id
;

-- WHERE
--       IFNULL(e.date_entrega, NOW()) > "2018-08-31 23:59:59"
--   AND e.partner_id IN ( 294, 10, 339, 561, 410, 481, 189, 16, 335 )

--  --  AND v.envases_id IN (
--  --        778, 1251, 501, 1460, 1475, 453, 1451, 1559, 408, 518, 519, 925, 1102
--  --      , 731, 1160, 709, 1245, 651, 575, 1640, 1711, 2480, 63, 2839, 2701, 2692
--  --      , 2863, 2907, 2164, 2849, 206, 1737, 330, 723, 23, 1867, 293, 284
--  -- )
--   -- AND IFNULL(v.receptions_quantity, 0) > 20
-- GROUP BY e.entrega_id
-- -- LIMIT 10
-- ;

-- SELECT * FROM debug;
-- CALL debug_off('JSON_ARRAYAGG');



/*
{
  "_id": "Movement_2_180828121207012356",
  "data": {
    "id": "180828121207012356",
    "inOut": "in",
    "type": "movement",
    "status": "new",
    "bottles": [
      100018,
      100025,
      100796
    ],
    "customer": 12362,
    "inventory": 12356
  }
}
*/

-- SELECT
--   CONCAT(
--     '          , "'
--   , column_name
--   , '", IFNULL(e.'
--   , column_name
--   , ', '
--   , IF(
--       DATA_TYPE = 'int'
--         , '0'
--             , IF(
--                 DATA_TYPE = 'datetime'
--                   , 'NOW()'
--                   , '"FALTA"'
--               )
--     )
--     , ')'
--   )
--   -- , DATA_TYPE
-- FROM
--   information_schema.columns
-- WHERE
--       table_schema = 'ib2018'
--   AND table_name = 'tb_entregas'
--   AND column_name in (
--       'entrega_id'
--     -- , cod
--     -- , entrega_id
--     -- , entrega_lines_id
--     , 'partner_id'
--     , 'date_entrega'
--     , 'user_id'
--     , 'invoice_nr'
--     , 'bottles_quantity'
--     , 'notes'
--     , 'invoiced'
--     , 'ent_canceled'
--   )
-- ORDER BY ordinal_position DESC
-- ;

