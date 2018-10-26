SELECT
  CONCAT(
    JSON_OBJECT(
        "_id", concat("aPerson_1_", lpad(p.partner_id, 16, 0))
      , "data", JSON_OBJECT(
          "idIB", p.partner_id
        , "type", "person_bottle_move"
        , "bottle_movements", JSON_ARRAYAGG(IFNULL(s.movement_id, 0))
      )
    ), ","
  )

FROM
  tb_partners p
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
;
