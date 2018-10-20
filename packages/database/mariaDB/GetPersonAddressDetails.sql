-- SELECT
--     CONCAT(
--       JSON_OBJECT(
--           "_id", concat("aPerson_1_", lpad(p.partner_id, 16, 0))
--         , "data", JSON_OBJECT(
--                 "idIB", lpad(p.partner_id, 5, 0)
--               , "type", "person"
--               , "ruc_cedula", CONCAT("|", IFNULL(p.partner_legal_id, "FALTA"), "|")
--               , "nombre", p.partner_name
--               , "direccion", p.partner_name
--               , "telefono_1", CONCAT("|", IFNULL(p.partner_telf_primary, "FALTA"), "|")
--               , "telefono_2", CONCAT("|", IFNULL(p.partner_telf_secundary, "FALTA"), "|")
--               , "mobile", CONCAT("|", IFNULL(p.partner_celular_phone, "FALTA"), "|")
--               , "distribuidor", "hq"
--               , "retencion", "no"
--               , "email", IFNULL(p.partner_email, "FALTA")
--               , "address_details", lpad(p.partner_id, 5, 0)
--               , "bottle_movements", lpad(p.partner_id, 5, 0)
--               , "admin_details", lpad(p.partner_id, 5, 0)
--               , "bottles", JSON_ARRAYAGG(IFNULL(e.envases_id, 0))
--             )
--       ), ","
--     )
-- FROM
--     tb_partners p
--   , tb_envases e
-- WHERE
--   p.partner_id = e.last_partner_id
--  and p.partner_id between 312 and 317
-- GROUP BY p.partner_id

SELECT
    DATA_TYPE
  , CONCAT(
      '               , "'
    , column_name
    , '", IFNULL('
    , column_name
    , ', '
    , IF(
        DATA_TYPE = 'int'
          , '0'
              , IF(
                  DATA_TYPE = 'datetime'
                    , 'NOW()'
                    , '"FALTA"'
                )
      )
    , ')'
  )
FROM
  information_schema.columns
WHERE
      table_schema = 'ib2018'
  AND table_name = 'tb_partners'
  -- AND column_name in (
  --     'partner_id'
  --   , 'partner_legal_id'
  --   , 'partner_name'
  --   , 'partner_email'
  --   , 'partner_telf_primary'
  --   , 'partner_telf_secundary'
  --   , 'partner_celular_phone'
  -- )
;
