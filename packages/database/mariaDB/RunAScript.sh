mysql ${DBPRMS} < $1 > temp.txt
# cat temp.txt;

sed -i 's/"\[\\\\/\[/g;  s/\\\\", \\\\"/", "/g; s/\\\\"\]"/"\]/g; s/}$/},/g;' temp.txt
sed -i -E -e 's/"([0-9]+)"/\1/g; s/"\|([^"]+)\|"/"\1"/g;' temp.txt;
sed -i '$ s/.$//' temp.txt;
cat prefix.txt temp.txt suffix.txt > rslt.json

cat rslt.json
cat rslt.json | jq .
