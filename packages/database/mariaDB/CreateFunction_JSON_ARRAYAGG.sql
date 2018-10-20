DELIMITER //

DROP FUNCTION IF EXISTS JSON_ARRAYAGG//

CREATE AGGREGATE FUNCTION IF NOT EXISTS JSON_ARRAYAGG(next_value TEXT) RETURNS TEXT
DETERMINISTIC
BEGIN

  DECLARE l_proc_id varchar(100) default 'test_debug';

  DECLARE json JSON DEFAULT '[""]';
  DECLARE CONTINUE HANDLER FOR NOT FOUND RETURN json_remove(json, '$[0]');
  -- CALL debug_on(l_proc_id);

  -- CALL debug_insert(l_proc_id, 'Starting to Loop');

    LOOP
      FETCH GROUP NEXT ROW;
      SET json = json_array_append(json, '$', next_value);
      -- CALL debug_insert(l_proc_id, next_value);
    END LOOP;

END

//

DELIMITER ;
