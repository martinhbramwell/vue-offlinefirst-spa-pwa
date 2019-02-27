#!/usr/bin/env bash
#

installNodeJs()
{

  export NVM_DIR="$HOME/.nvm";
  mkdir -p ${NVM_DIR};

  echo -e "Prepare NodeJS versions ...";
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

  # export INSTALL="jq";
  # dpkg-query -s ${INSTALL} >/dev/null && echo " - ${INSTALL} is installed" || sudo apt-get install -y ${INSTALL};

  # export PURGE="nodejs";
  # dpkg-query -s ${PURGE} &>/dev/null && sudo apt-get purge -y ${PURGE} || echo " - ${PURGE} has been purged";

  export NVM_VERSION=$(curl -s https://api.github.com/repos/creationix/nvm/releases/latest | jq -r ".name");
  export NVM_INSTALLED=$(nvm --version &>/dev/null);
  if [[  "${NVM_VERSION}" = "v${NVM_INSTALLED}"  ]]; then
    echo -e " - nvm '${NVM_VERSION}' is installed";
  else
    echo -e " - freshen nvm '${NVM_VERSION}'";
    wget -qO- https://raw.githubusercontent.com/creationix/nvm/${NVM_VERSION}/install.sh | bash;

    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
  fi;

  # # export NODE_VERSION=4;
  # # nvm ls ${NODE_VERSION} >/dev/null \
  # #   && echo " - node '$( nvm version ${NODE_VERSION})' is installed" \
  # #   || nvm install ${NODE_VERSION};

  # # export NODE_VERSION=6;
  # # nvm ls ${NODE_VERSION} >/dev/null \
  # #   && echo " - node '$( nvm version ${NODE_VERSION})' is installed" \
  # #   || nvm install ${NODE_VERSION};

  # export NODE_VERSION=8;
  # nvm ls ${NODE_VERSION} >/dev/null \
  #   && echo " - node '$( nvm version ${NODE_VERSION})' is installed" \
  #   || nvm install ${NODE_VERSION};

  nvm install node;

  echo "### Npm and NodeJS installed ";
  nvm use stable;

  echo -e "\n nvm version :: $(nvm --version)";
  echo -e "node version :: $(node --version)";
  echo -e " npm version :: $(npm --version)";
  echo -e "";

  # NCU_ID="npm-check-updates";
  # NCU_VER=$(npm view ${NCU_ID} version 2>/dev/null) || npm install -g npm-check-updates;
  # # echo -e "### '${NCU_ID}@$(npm view ${NCU_ID} version)' installed";

}


if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  installNodeJs;
fi;
