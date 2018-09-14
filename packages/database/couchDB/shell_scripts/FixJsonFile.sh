#!/usr/bin/env bash
#
EXPORTED_FILE=${1};
FILE=${2}.json;
cat StartBracket.txt ${EXPORTED_FILE} > ${FILE};
echo "@@" >> ${FILE};		# put a flag beside last comma
#
sed -i '/"{/s//    {/' ${FILE}; # trim all leading quotes
sed -i 's/"/,/g' ${FILE};	# replace end of line double quote with comma
sed -i 's/,@@//g' ${FILE};	# remove end of file comma
sed -i "s/'/\"/g" ${FILE};	# replace all single quotes with doubles
cat EndBracket.txt >> ${FILE};

head -n 4 ${FILE};
echo "              :";
echo "              :";
tail -n 4 ${FILE};
