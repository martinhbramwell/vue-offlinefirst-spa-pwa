#!/usr/bin/env bash
#
set -e;

# pip3 install passlib;

pushd ${XDG_RUNTIME_DIR} > /dev/null;
  # echo -e "PWD :: $1";
  cat << EOF > pyscript.py
#!/usr/bin/python3
from passlib.hash import pbkdf2_sha256

pbkdf = pbkdf2_sha256.hash('$1')
print(pbkdf)

EOF
  chmod 755 pyscript.py;
  ./pyscript.py
popd > /dev/null;

