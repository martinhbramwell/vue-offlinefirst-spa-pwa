SH_PID=$(ps faux | grep -v grep | grep "sh -c" | grep "vue-cli-service"  | awk '{ print $2 }');
echo -e "Killing PID ${SH_PID}";
kill -9 ${SH_PID};
DO_PID=$(ps faux | grep -v grep | grep -v "sh -c" | grep "vue-cli-service"  | awk '{ print $2 }');
echo -e "Killing PID ${DO_PID}";
kill -9 ${DO_PID};
