#!/usr/bin/env bash
#
sudo -A tee ${TMPLT_FILE} <<EOF >/dev/null
Splidge
  These contents will be ${RFRF}.
EOF
