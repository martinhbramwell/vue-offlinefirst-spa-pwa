#!/usr/bin/env bash
#
while inotifywait -r -e modify,create,delete,move ./serverSideFiles/; do
  rsync -avz ./serverSideFiles/ IridiumBlueGDF:/home/you/setupScripts/;
done;

