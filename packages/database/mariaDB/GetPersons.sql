-- DELETE FROM debug;
-- CALL debug_on('JSON_ARRAYAGG');


SELECT
  CONCAT(
    JSON_OBJECT(
        "_id", concat("aPerson_1_", lpad(p.partner_id, 16, 0))
      , "data", JSON_OBJECT(
          "idIB", p.partner_id
        , "type", "person"
        , "ruc_cedula", CONCAT("|", IFNULL(p.partner_legal_id, "FALTA"), "|")
        , "nombre", p.partner_name
        , "es_empresa", IF(LCASE(IFNULL(p.partner_company, "no")) = "y", "si", "no")
        , "es_client", IF(LCASE(IFNULL(p.partner_company, "no")) = "y", "si", "no")
        , "es_proveedor", IF(LCASE(IFNULL(p.partner_supplier, "no")) = "y", "si", "no")
        , "direccion", CONCAT(IFNULL(p.street_acc, ""), ", ", IFNULL(p.partner_parish_acc, ""), ", ", IFNULL(p.partner_city_acc, ""), ", ", IFNULL(p.partner_canton_acc, ""), ", ", IFNULL(p.partner_postal_code_acc, ""))
        , "telefono_1", CONCAT("|", IFNULL(p.partner_telf_primary, "FALTA"), "|")
        , "telefono_2", CONCAT("|", IFNULL(p.partner_telf_secundary, "FALTA"), "|")
        , "mobile", CONCAT("|", IFNULL(p.partner_celular_phone, "FALTA"), "|")
        , "distribuidor", "hq"
        , "retencion", "no"
        , "email", IFNULL(p.partner_email, "FALTA")
        , "address_details", p.partner_id
        , "bottle_movements", p.partner_id
        , "admin_details", p.partner_id
        , "bottles", JSON_ARRAYAGG(IFNULL(e.envases_id, 0))
        -- , "bottles", JSON_ARRAYAGG(IFNULL(e.envases_id, 0))
      )
    ), ","
  )
FROM
  tb_partners p LEFT JOIN tb_envases e ON p.partner_id = e.last_partner_id
WHERE
      p.partner_id in (select distinct partner from short_list where envase_id < 600)
  and e.envases_id in  (select distinct envase_id from short_list where envase_id < 600)
GROUP BY p.partner_id
;

-- from short_list s, tb_partners p
-- where envase_id < 600
--   and p.partner_id = s.partner
-- ;

  --     e.last_partner_id in (1, 294, 10, 339, 561, 410, 481, 189, 16, 335)
  -- --     V.cod between "I" and  "J"
  -- -- and e.envases_id IN (
  -- --         778, 1251, 501, 1460, 1475, 453, 1451, 1559, 408, 518, 519, 925, 1102
  -- --       , 731, 1160, 709, 1245, 651, 575, 1640, 1711, 2480, 63, 2839, 2701, 2692
  -- --       , 2863, 2907, 2164, 2849, 206, 1737, 330, 723, 23, 1867, 293, 284
  -- -- )

-- LIMIT 1
-- LIMIT 2;

-- SELECT * FROM debug;
-- CALL debug_off('JSON_ARRAYAGG');




-- DESCRIBE tb_partners;
-- DESCRIBE tb_envases;

/*
{
  "_id": "aPerson_1_0000000000012345",
  "data": {
    "idIB": "12345",
    "type": "person",
    "codigo": "100",
    "ruc_cedula": "1713931416001",
    "nombre": "Logichem",
    "direccion": "Km 11 Cumbaya",
    "telefono": "237-2748",
    "distribuidor": "hq",
    "retencion": "no",
    "email": "dlwild@gmail.com",
    "bottles": [
      100001,
      100002,
      100003
    ]
  }
}
*/


-- SELECT
--     CONCAT(
--       '              , "'
--     , column_name
--     , '", IFNULL(p.'
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
--   , DATA_TYPE
-- FROM
--   information_schema.columns
-- WHERE
--       table_schema = 'ib2018'
--   AND table_name = 'tb_partners'
--   AND column_name in (
--       'partner_id'
--     , 'partner_legal_id'
--     , 'partner_name'
--     , 'partner_email'
--     , 'partner_telf_primary'
--     , 'partner_telf_secundary'
--     , 'partner_celular_phone'
--     , 'partner_company'
--     , 'partner_client'
--     , 'partner_supplier'
--   )
-- ;
