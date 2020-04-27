#!/usr/bin/env bash
#
set -e;
echo -e "Going to next step.";
read -p "Are you sure? " -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "Do the next thing.";
  else
    echo -e "Won't do the next thing.";
fi;
