DROP TABLE IF EXISTS debug;
CREATE TABLE  debug (
  proc_id varchar(100) default NULL,
  debug_output text,
  line_id int(11) NOT NULL auto_increment,
  PRIMARY KEY  (line_id)
);


DELIMITER //

DROP PROCEDURE IF EXISTS debug_insert;
CREATE PROCEDURE debug_insert(in p_proc_id varchar(100), in p_debug_info text)
 BEGIN
  INSERT INTO debug (proc_id, debug_output)
  VALUES (p_proc_id,p_debug_info);
 END;

DROP PROCEDURE IF EXISTS debug_on;
CREATE PROCEDURE debug_on(in p_proc_id varchar(100))
 BEGIN
  CALL debug_insert(p_proc_id, CONCAT("Debug Started: ", now()));
 END;

DROP PROCEDURE IF EXISTS debug_off;
CREATE PROCEDURE debug_off(in p_proc_id varchar(100))
 BEGIN
  CALL debug_insert(p_proc_id, CONCAT("Debug Ended: ",now()));
  SELECT proc_id, debug_output FROM debug WHERE proc_id = p_proc_id ORDER BY line_id;
  DELETE FROM debug WHERE proc_id = p_proc_id;
 END;

DROP PROCEDURE IF EXISTS test_debug;
CREATE PROCEDURE test_debug()
BEGIN
  DECLARE l_proc_id varchar(100) default 'test_debug';
  CALL debug_on(l_proc_id);
  CALL debug_insert(l_proc_id,'Testing Debug');
  CALL debug_off(l_proc_id);
 END;


//

DELIMITER ;

CALL test_debug;




-- DROP PROCEDURE IF EXISTS debug_on;
-- CREATE PROCEDURE debug_on(in p_proc_id varchar(100))
-- begin
--   call debug_insert(p_proc_id,concat("Debug Started :",now()));
--   call debug_insert(p_proc_id,concat("Debug Started :",now()));
-- end

-- CREATE PROCEDURE debug_insert(in p_proc_id varchar(100),in p_debug_info text)
-- begin
--   insert into debug (proc_id,debug_output)
--   values (p_proc_id,p_debug_info);
-- end $$

-- CREATE PROCEDURE debug_off(in p_proc_id varchar(100))
-- begin
--   call debug_insert(p_proc_id,concat('Debug Ended :',now()));
--   select debug_output from debug where proc_id = p_proc_id order by line_id;
--   delete from debug where proc_id = p_proc_id;
-- end $$

