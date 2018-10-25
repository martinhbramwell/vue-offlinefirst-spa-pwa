
update tb_envases
  set last_partner_id = 1
where location = "lleno"
;


DROP VIEW IF EXISTS IN2018;
CREATE VIEW IN2018 AS
SELECT
    v.envases_id as envase_id
  , IFNULL(m.recepcion_id, 0) AS movement
  , v.cod
  , IFNULL(m.partner_id, 0) AS partner
  , 1 as inventory
  , IFNULL(m.date_recepcion, NOW()) AS move_date
  , "I" AS direction
  , IFNULL(m.notes, "") as move_notes
  , IFNULL(m.bottles_quantity, "") as bottles_quantity
  , 0 as invoiced
  , 0 as invoice_nr
  , IFNULL(m.recepcion_responsable, 0) as user_id
  , IFNULL(v.last_partner_id, "") as last_partner_id
  , IFNULL(v.date_purchase, NOW()) as fechaCompra
  , IFNULL(v.location, "FALTA") as ubicacion
  , IFNULL(v.delivery_quantity, 0) as deliveries
  , IFNULL(v.receptions_quantity, 0) as returns
  , IFNULL(v.client_id, 0) as client_id
  , IF(IFNULL(v.property_client, "no") != "N", "si", "no") as property_client
  , IF(IFNULL(v.property_ib, "no") != "N", "si", "no") as property_ib
  , CONCAT("|", IFNULL(p.partner_legal_id, "FALTA"), "|") as ruc_cedula
  , IFNULL(p.partner_name, "FALTA") as nombre
  , IF(LCASE(IFNULL(p.partner_company, "no")) = "y", "si", "no") as es_empresa
  , IF(LCASE(IFNULL(p.partner_company, "no")) = "y", "si", "no") as es_client
  , IF(LCASE(IFNULL(p.partner_supplier, "no")) = "y", "si", "no") as es_proveedor
  , CONCAT(IFNULL(p.street_acc, ""), ", ", IFNULL(p.partner_parish_acc, ""), ", ", IFNULL(p.partner_city_acc, ""), ", ", IFNULL(p.partner_canton_acc, ""), ", ", IFNULL(p.partner_postal_code_acc, "")) as direccion
  , CONCAT("|", IFNULL(p.partner_telf_primary, "FALTA"), "|") as telefono_1
  , CONCAT("|", IFNULL(p.partner_telf_secundary, "FALTA"), "|") as telefono_2
  , CONCAT("|", IFNULL(p.partner_celular_phone, "FALTA"), "|") as mobile
  , "hq" as distribuidor
  , "no" as retencion
  , IFNULL(p.partner_email, "FALTA") as email
  , p.partner_id as address_details
  , p.partner_id as bottle_movements
  , p.partner_id as admin_details
FROM
    tb_recepciones m INNER JOIN tb_recepciones_lines l ON l.recepciones_id = m.recepcion_id
  INNER JOIN tb_envases v ON v.cod = l.cod
  INNER JOIN tb_partners p ON p.partner_id = m.partner_id
-- WHERE
--       IFNULL(m.date_recepcion, NOW()) > "2018-01-01 23:59:59"
;

DROP VIEW IF EXISTS OUT2018;
CREATE VIEW OUT2018 AS
SELECT
    v.envases_id as envase_id
  , IFNULL(m.entrega_id, 0) AS movement
  , v.cod as cod
  , IFNULL(m.partner_id, 0) AS partner
  , 1 as inventory
  , IFNULL(m.date_entrega, NOW()) AS move_date
  , "O" AS direction
  , IFNULL(m.notes, "") as move_notes
  , IFNULL(m.bottles_quantity, "") as bottles_quantity
  , IFNULL(m.invoiced, 0) as invoiced
  , IFNULL(m.invoice_nr, 0) as invoice_nr
  , IFNULL(m.user_id, 0) as user_id
  , IFNULL(v.last_partner_id, "") as last_partner_id
  , IFNULL(v.date_purchase, NOW()) as fechaCompra
  , IFNULL(v.location, "FALTA") as ubicacion
  , IFNULL(v.delivery_quantity, 0) as deliveries
  , IFNULL(v.receptions_quantity, 0) as returns
  , IFNULL(v.client_id, 0) as client_id
  , IF(IFNULL(v.property_client, "no") != "N", "si", "no") as property_client
  , IF(IFNULL(v.property_ib, "no") != "N", "si", "no") as property_ib
  , CONCAT("|", IFNULL(p.partner_legal_id, "FALTA"), "|") as ruc_cedula
  , IFNULL(p.partner_name, "FALTA") as nombre
  , IF(LCASE(IFNULL(p.partner_company, "no")) = "y", "si", "no") as es_empresa
  , IF(LCASE(IFNULL(p.partner_company, "no")) = "y", "si", "no") as es_client
  , IF(LCASE(IFNULL(p.partner_supplier, "no")) = "y", "si", "no") as es_proveedor
  , CONCAT(IFNULL(p.street_acc, ""), ", ", IFNULL(p.partner_parish_acc, ""), ", ", IFNULL(p.partner_city_acc, ""), ", ", IFNULL(p.partner_canton_acc, ""), ", ", IFNULL(p.partner_postal_code_acc, "")) as direccion
  , CONCAT("|", IFNULL(p.partner_telf_primary, "FALTA"), "|") as telefono_1
  , CONCAT("|", IFNULL(p.partner_telf_secundary, "FALTA"), "|") as telefono_2
  , CONCAT("|", IFNULL(p.partner_celular_phone, "FALTA"), "|") as mobile
  , "hq" as distribuidor
  , "no" as retencion
  , IFNULL(p.partner_email, "FALTA") as email
  , p.partner_id as address_details
  , p.partner_id as bottle_movements
  , p.partner_id as admin_details

FROM
    tb_entregas m INNER JOIN tb_entregas_lines l ON l.entrega_id = m.entrega_id
  INNER JOIN tb_envases v ON v.cod = l.cod
  INNER JOIN tb_partners p ON p.partner_id = m.partner_id
-- WHERE
--       IFNULL(m.date_entrega, NOW()) > "2018-01-01 23:59:59"
;

DROP VIEW IF EXISTS all_moves;
CREATE VIEW all_moves AS
-- SELECT distinct envase_id, movement, cod, partner, move_date, direction, last_partner_id
-- SELECT distinct *
SELECT *
-- SELECT "In", COUNT(*)
FROM  IN2018
WHERE move_date > "2018-08-15"
  -- AND partner != 151
-- LIMIT 16
-- ;
-- WHERE move_date > date_add("2018-04-01", INTERVAL 0 DAY)
  -- AND partner in (2, 3, 4, 5, 10, 14, 15, 16, 18, 22, 24, 25, 29, 31, 32, 34, 35, 36, 37)
union all
-- SELECT distinct envase_id, movement, cod, partner, move_date, direction, last_partner_id
-- SELECT distinct *
SELECT *
-- SELECT "Out", COUNT(*)
FROM OUT2018
WHERE move_date > "2018-08-15"
-- LIMIT 16
-- WHERE move_date between date_add("2018-04-01", INTERVAL 1 DAY) and date_add("2018-06-01", INTERVAL 200 DAY)
  -- AND partner in (2, 3, 4, 5, 10, 14, 15, 16, 18, 22, 24, 25, 29, 31, 32, 34, 35, 36, 37)
-- ORDER BY envase_id, partner, movement
;

/*

+----------+
| entregas |
+----------+
|     9875 |
+----------+

+---------+
| envases |
+---------+
|    2907 |
+---------+

+----------+
| partners |
+----------+
|      697 |
+----------+

+-------------+
| recepciones |
+-------------+
|       18053 |

*/
-- SELECT CONCAT(envase_id, ", "), COUNT(*) AS count FROM all_moves
-- GROUP BY envase_id
-- HAVING COUNT > 1
-- ;

-- SELECT "In", COUNT(*) FROM all_moves
-- WHERE direction = "I"
-- ;

-- SELECT "Out", COUNT(*) FROM all_moves
-- WHERE direction = "O"
-- ;

-- SELECT envase_id, count(*) FROM all_moves
-- GROUP BY envase_id
-- LIMIT 10
-- ;


DROP VIEW IF EXISTS short_list;
CREATE VIEW short_list AS

-- SELECT i.envase_id, count(*)
SELECT i.envase_id, i.cod, i.movement, i.partner, i.ubicacion, i.direction, i.move_date, i.last_partner_id
-- SELECT *
-- SELECT count(*)
FROM all_moves o, all_moves i
WHERE i.envase_id = o.envase_id
  AND i.direction = "I"
  AND o.direction = "O"
  -- AND i.last_partner_id = 1
  -- -- AND o.partner != 1
  -- -- AND o.envase_id != 501
-- GROUP BY i.envase_id
-- ORDER BY o.move_date, i.move_date
-- LIMIT 16
-- ;

UNION ALL

-- SELECT *
SELECT i.envase_id, i.cod, o.movement, o.partner, i.ubicacion, o.direction, o.move_date, i.last_partner_id
-- -- SELECT count(*)
FROM all_moves o, all_moves i
WHERE i.envase_id = o.envase_id
  AND i.direction = "I"
  AND o.direction = "O"
  -- AND o.partner in (71, 295,  193,  628,  569,  465,  633,  359,  326,  683,  468,  152,  555)
-- GROUP BY o.partner
-- HAVING count(*) = 3
-- -- ORDER BY count(*) asc
;


select *
from short_list
where envase_id < 600
  order by envase_id
;

-- select distinct envase_id
-- from short_list
-- where envase_id < 600
-- ;

-- select distinct *
-- from short_list s, tb_partners p
-- where envase_id < 600
--   and p.partner_id = s.partner
-- ;

  select distinct partner, envase_id, movement, cod
    from short_list
   where envase_id < 600
     and direction = "O"
     and partner != 1
  -- order by partner
  -- order by envase_id
  order by envase_id

-- select distinct partner, envase_id, movement, ubicacion, direction
-- from short_list
-- where envase_id < 22
-- order by envase_id
-- ;



-- SELECT count(*) FROM OUT2018
-- WHERE move_date between @out_date and date_add(@out_date, INTERVAL 1 DAY)
--   AND cod like "IBAA%"
-- ;
-- -- UNION ALL
-- SELECT count(*) FROM IN2018
-- WHERE move_date between @in_date and date_add(@in_date, INTERVAL 5 DAY)
--   AND cod like "IBAA%"
-- ORDER BY envase_id, partner, movement
-- ;

