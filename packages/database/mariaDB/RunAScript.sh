mysql ${DBPRMS} < $1 > temp.txt
# cat temp.txt;
# echo "-------------";
sed -i 's/"\[\\\\/\[/g;  s/\\\\", \\\\"/", "/g; s/\\\\"\]"/"\]/g; s/}$/},/g;' temp.txt
sed -i -E -e 's/"([0-9]+)"/\1/g; s/"\|([^"]+)\|"/"\1"/g;' temp.txt;
sed -i 's/\\\\"/,/g;' temp.txt
sed -i 's/VÃƒÂ.a/Vía a/g; s/ã./á/g;' temp.txt
sed -i 's/Ã³/ó/g; s/Ãº/ú/g; s/Ã¡/á/g;' temp.txt
sed -i '$ s/.$//' temp.txt;
sed -i 's/\\\\\\\\,//g; s/\"{|/{|/g; s/}\", {|/}, {|/g; s/}\"]/}]/g; ' temp.txt
sed -i 's/||/FALTA/g; s/|/\"/g; ' temp.txt


# cat temp.txt;
# exit;

cat prefix.txt temp.txt suffix.txt > rslt.json

# cat rslt.json
# exit;

cat rslt.json | jq .

