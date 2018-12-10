-- DELETE FROM debug;
-- CALL debug_on('JSON_ARRAYAGG');



SELECT
  -- e.envases_id
  -- e.envases_id, s.direction, JSON_ARRAYAGG(IFNULL(s.movement, 0))
  -- count(*)
  CONCAT(
    JSON_OBJECT(
        "_id", concat("aPerson_1_", lpad(p.partner_id, 16, 0))
      , "data", JSON_OBJECT(
          "codigo", p.partner_id
        , "type", "person"
        , "idib", p.partner_id
        , "ruc_cedula", CONCAT("|", IFNULL(p.partner_legal_id, "FALTA"), "|")
        , "tipo_de_documento", if(partner_legal_id REGEXP '^[[:digit:]]+$'
            , if(partner_legal_id*1 = 0
              , '_07'
              , if(partner_nationality = 'EC'
                , if(length(partner_legal_id) = 13
                  , '_04'
                  , if(length(partner_legal_id) = 10
                    , '_05'
                    , '_07'
                  )
                )
                , if(partner_legal_id like '17%'
                  , if(length(partner_legal_id) = 13
                    , '_04'
                    , if(length(partner_legal_id) = 10
                      , '_05'
                      , '_07'
                    )
                  )
                  , '_06'
                )
              )
            )
            , if(partner_legal_id = "INCOMPLETO"
                , '_07'
                , '_06'
              )
          )
        , "nombre", p.partner_name
        , "es_empresa", IF(LCASE(IFNULL(p.partner_company, "no")) = "y", "si", "no")
        , "es_client", IF(LCASE(IFNULL(p.partner_company, "no")) = "y", "si", "no")
        , "es_proveedor", IF(LCASE(IFNULL(p.partner_supplier, "no")) = "y", "si", "no")
        , "direccion", CONCAT(IFNULL(p.street_acc, ""), ", ", IFNULL(p.partner_parish_acc, ""), ", ", IFNULL(p.partner_city_acc, ""), ", ", IFNULL(p.partner_canton_acc, ""), ", ", IFNULL(p.partner_postal_code_acc, ""))
        , "telefono_1", CONCAT("|", IFNULL(p.partner_telf_primary, "FALTA"), "|")
        , "telefono_2", CONCAT("|", IFNULL(p.partner_telf_secundary, "FALTA"), "|")
        , "mobile", CONCAT("|", IFNULL(p.partner_celular_phone, "FALTA"), "|")
        , "role", if(d.partner_id in (1,2), "Sede Principal", if(d.distribuidor="Y", "Distribuidor", "Cliente"))
        , "distribuidor", if(d.distribuidor="Y", "si", "no")
        , "retencion", "no"
        , "email", IFNULL(p.partner_email, "FALTA")
        , "address_details", p.partner_id
        , "bottle_movements", p.partner_id
        , "admin_details", p.partner_id
        , "bottles", JSON_ARRAYAGG(IFNULL(e.envases_id, 0))
      )
    ), ","
  )

FROM
  tb_partners p
    JOIN tb_ib_partners_especial_data d ON p.partner_id = d.partner_id
    JOIN tb_envases e ON p.partner_id = e.last_partner_id
    JOIN short_list s ON
          s.partner = e.last_partner_id
      AND s.partner = p.partner_id
      AND e.envases_id = s.envase_id
WHERE
      p.partner_id in (select distinct partner from short_list where envase_id < 600)
  and e.envases_id in  (select distinct envase_id from short_list where envase_id < 600)
  and s.envase_id < 600

GROUP BY p.partner_id
ORDER BY p.partner_id
-- limit 3
;

-- select
--     partner_id
--   , partner_nationality
--   , partner_legal_id
--   , if(partner_legal_id REGEXP '^[[:digit:]]+$'
--     , if(partner_legal_id*1 = 0
--       , '_07'
--       , if(partner_nationality = 'EC'
--         , if(length(partner_legal_id) = 13
--           , '_04'
--           , if(length(partner_legal_id) = 10
--             , '_05'
--             , '_07'
--           )
--         )
--         , if(partner_legal_id like '17%'
--           , if(length(partner_legal_id) = 13
--             , '_04'
--             , if(length(partner_legal_id) = 10
--               , '_05'
--               , '_07'
--             )
--           )
--           , '_06'
--         )
--       )
--     )
--     , if(partner_legal_id = "INCOMPLETO"
--         , '_07'
--         , '_06'
--       )
--   )
--   as tipo_documento
--   from tb_partners where partner_nationality != "EC";

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
    "idib": "12345",
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
