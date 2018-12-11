SELECT DISTINCT
    CONCAT(
      JSON_OBJECT(
          "_id", concat("profile_1_", lpad(p.partner_id, 16, 0))
        , "data", JSON_OBJECT(
            "type", "profile"
          , "idib", IFNULL(p.partner_id, 0)
          , "partner_last_update", IFNULL(p.partner_last_update, NOW())
          , "partner_creation_date", IFNULL(p.partner_creation_date, NOW())
          , "partner_create_by", IFNULL(p.partner_create_by, "FALTA")
          , "partner_status", IFNULL(p.partner_status, "FALTA")
          , "partner_sales_person", IFNULL(p.partner_sales_person, "FALTA")
          , "partner_notes", IFNULL(p.partner_notes, "FALTA")
          , "partner_contact_person", IFNULL(p.partner_contact_person, "FALTA")
          , "partner_webPage", IFNULL(p.partner_webPage, "FALTA")
          , "partner_group_code", IFNULL(p.partner_group_code, "FALTA")
          , "partner_nationality", IFNULL(p.partner_nationality, "FALTA")
          , "partner_gender", IFNULL(p.partner_gender, "FALTA")
          , "partner_civil_status", IFNULL(p.partner_civil_status, "FALTA")
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
--       '          , "'
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
--     , 'partner_civil_status'
--     , 'partner_gender'
--     , 'partner_nationality'
--     , 'partner_group_code'
--     , 'partner_webPage'
--     , 'partner_contact_person'
--     , 'partner_notes'
--     , 'partner_sales_person'
--     , 'partner_status'
--     , 'partner_create_by'
--     , 'partner_creation_date'
--     , 'partner_last_update'
-- )
-- ORDER BY ordinal_position DESC
-- ;
