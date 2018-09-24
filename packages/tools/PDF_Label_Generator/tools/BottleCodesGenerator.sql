select distinct
    substring(cod, 1, 4)
  , rpad(substring(cod, 5, 1), 3, 0)
  , concat(rpad(substring(cod, 5, 2), 3, 0), ".pdf")
  , concat(cod)
from
  tb_envases
order by cod
INTO OUTFILE '/tmp/envases.csv'
FIELDS ENCLOSED BY '"'
TERMINATED BY ','
LINES TERMINATED BY '\r\n'
;
