-- -- DELETE FROM debug;
-- -- CALL debug_on('JSON_ARRAYAGG');


SELECT
  CONCAT(
    JSON_OBJECT(
        "_id", concat("Movement_2_", CONCAT(
            DATE_FORMAT(IFNULL(r.date_recepcion, NOW()), "%Y%m%d%H%i%S")
          , "I"
          , LPAD(CAST(IFNULL(r.partner_id, 0) as CHAR(5)), 5, "0"))
          )
      , "data", JSON_OBJECT(
          "id", CONCAT(
              DATE_FORMAT(IFNULL(r.date_recepcion, NOW()), "%Y%m%d%H%i%S")
            , "I"
            , LPAD(CAST(IFNULL(r.partner_id, 0) as CHAR(5)), 5, "0")
            )
        , "inOut", "in"
        , "type", "movement"
        , "status", "new"
        , "bottles", JSON_ARRAYAGG(IFNULL(v.envases_id, 0))
        , "customer", IFNULL(r.partner_id, 0)
        , "inventory", 1
        , "notes", IFNULL(r.notes, "")
        , "bottles_quantity", IFNULL(r.bottles_quantity, 0)
        , "recepcion_responsable", IFNULL(r.recepcion_responsable, 0)
      )
    ), ","
  )
FROM
  tb_recepciones r INNER JOIN tb_recepciones_lines l ON l.recepciones_id = r.recepcion_id
  INNER JOIN tb_envases v ON v.cod = l.cod
WHERE
  IFNULL(r.date_recepcion, NOW()) > "2017-12-31 23:59:59"
  AND IFNULL(v.receptions_quantity, 0) > 20
GROUP BY r.recepcion_id
-- LIMIT 10
;

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
--     '        , "'
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
--   AND table_name = 'tb_recepciones'
--   -- AND column_name in (
--   --     'recepcion_id'
--   --   -- , cod
--   --   -- , recepcion_id
--   --   -- , entrega_lines_id
--   --   , 'partner_id'
--   --   , 'date_recepcion'
--   --   , 'user_id'
--   --   , 'invoice_nr'
--   --   , 'bottles_quantity'
--   --   , 'notes'
--   --   , 'invoiced'
--   --   , 'ent_canceled'
--   -- )
-- ORDER BY ordinal_position DESC
-- ;

