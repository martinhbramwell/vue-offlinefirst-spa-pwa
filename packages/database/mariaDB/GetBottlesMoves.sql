SELECT DISTINCT
  -- v.envases_id, s.direction, JSON_ARRAYAGG(IFNULL(s.movement, 0))
  -- *
  -- count(*)
    CONCAT(
      JSON_OBJECT(
          "_id", concat("BottleMovement_1_", lpad(v.envases_id, 16, 0))
        , "data", JSON_OBJECT(
            "bottle", v.envases_id
          , "codigo", IFNULL(v.cod, "FALTA")
          , "type", "bottle_move"
          , "movements", JSON_ARRAYAGG(IFNULL(s.movement_id, 0))
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
