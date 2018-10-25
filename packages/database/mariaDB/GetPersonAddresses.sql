SELECT DISTINCT
    CONCAT(
      JSON_OBJECT(
          "_id", concat("address_1_", lpad(p.partner_id, 16, 0))
        , "data", JSON_OBJECT(
            "type", "address"
          , "idIB", IFNULL(p.partner_id, 0)
          , "partner_country_acc", TITLECASE(IFNULL(p.partner_country_acc, "FALTA"))
          , "partner_state_acc", TITLECASE(IFNULL(p.partner_state_acc, "FALTA"))
          , "partner_city_acc", TITLECASE(IFNULL(p.partner_city_acc, "FALTA"))
          , "partner_canton_acc", TITLECASE(IFNULL(p.partner_canton_acc, "FALTA"))
          , "partner_parish_acc", TITLECASE(IFNULL(p.partner_parish_acc, "FALTA"))
          , "partner_postal_code_acc", IFNULL(p.partner_postal_code_acc, "FALTA")
          , "street_acc", IFNULL(p.street_acc, "FALTA")
          , "bulding_acc", IFNULL(p.bulding_acc, "FALTA")
          , "country_res", TITLECASE(IFNULL(p.country_res, "FALTA"))
          , "state_res", TITLECASE(IFNULL(p.state_res, "FALTA"))
          , "city_res", TITLECASE(IFNULL(p.city_res, "FALTA"))
          , "canton_res", TITLECASE(IFNULL(p.canton_res, "FALTA"))
          , "parish_res", TITLECASE(IFNULL(p.parish_res, "FALTA"))
          , "postal_code_res", IFNULL(p.postal_code_res, "FALTA")
          , "street_res", IFNULL(p.street_res, "FALTA")
          , "bulding_res", IFNULL(p.bulding_res, "FALTA")
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
--   -- , DATA_TYPE
-- FROM
--   information_schema.columns
-- WHERE
--       table_schema = 'ib2018'
--   AND table_name = 'tb_partners'
--   AND column_name IN (
--       'partner_id'
--     , 'partner_country_acc'
--     , 'partner_state_acc'
--     , 'partner_city_acc'
--     , 'partner_canton_acc'
--     , 'partner_parish_acc'
--     , 'partner_postal_code_acc'
--     , 'street_acc'
--     , 'bulding_acc'
--     , 'country_res'
--     , 'state_res'
--     , 'city_res'
--     , 'canton_res'
--     , 'parish_res'
--     , 'postal_code_res'
--     , 'street_res'
--     , 'bulding_res'
--   )
-- ;
