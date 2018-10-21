export DBPRMS=" --defaults-file=${HOME}/.ssh/secrets/mysql-opts ib2018 -u root --silent"
export DBPRMST=" --defaults-file=${HOME}/.ssh/secrets/mysql-opts ib2018 -u root --table"

echo -e "{
    \"docs\" : [" > prefix.txt;
echo -e "    ]
}" > suffix.txt;

if [ -z $1 ]; then
  echo -e "

  To get tabular results from an sql file do

    mysql \${DBPRMST} <  xyz.sql

  To get tabular results from a single MariaDB Command do

    mysql \${DBPRMST} --execute  \"show tables\"

  To get raw results for piping to other operations do

    mysql \${DBPRMS} <  abc.sql



  "
fi
