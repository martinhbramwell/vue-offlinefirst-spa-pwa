let _="x";
source ./EnvVars_ManualInit.sh $_

mysql ${DBPRMS} < CreateFunction_JSON_ARRAYAGG.sql
mysql ${DBPRMS} < CreateFunction_TITLECASE.sql
mysql ${DBPRMS} < CreateProcedure_DEBUG.sql


mysql ${DBPRMS} --execute "drop index idxRecepcionesPartnerId on tb_recepciones"
mysql ${DBPRMS} --execute "drop index idxRecepcionesId on tb_recepciones_lines"
mysql ${DBPRMS} --execute "drop index idxRecepcionesLinesCode on tb_recepciones_lines"

mysql ${DBPRMS} --execute "drop index idxEntregasPartnerId on tb_entregas"
mysql ${DBPRMS} --execute "drop index idxEntregasId on tb_entregas_lines"
mysql ${DBPRMS} --execute "drop index idxEntregasLinesCode on tb_entregas_lines"

mysql ${DBPRMS} --execute "create index idxRecepcionesPartnerId on tb_recepciones(partner_id)"
mysql ${DBPRMS} --execute "create index idxRecepcionesId on tb_recepciones_lines(recepciones_id)"
mysql ${DBPRMS} --execute "create index idxRecepcionesLinesCode on tb_recepciones_lines(cod)"

mysql ${DBPRMS} --execute "create index idxEntregasPartnerId on tb_entregas(partner_id)"
mysql ${DBPRMS} --execute "create index idxEntregasId on tb_entregas_lines(entrega_id)"
mysql ${DBPRMS} --execute "create index idxEntregasLinesCode on tb_entregas_lines(cod)"


