#!/usr/bin/env bash

if [[ "$_" = "$0" ]]; then
 # && echo "Script is being sourced" ||
 echo "This script is meant to be sourced not executed."
 exit 1;
fi;

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

  To get raw results for piping to other operations do

    mysql \${DBPRMS} <  abc.sql

  To get tabular results from a single MariaDB Command do

    mysql \${DBPRMST} --execute  \"show tables\"

  To get JSON results from a specially prepared MariaDB query do

    ./RunAScript.sh  > Get<JSONresult>.sql



  "
fi
