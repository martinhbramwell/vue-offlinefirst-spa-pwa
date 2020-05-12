#!/usr/bin/env bash
#
export MYPWD="plokplok.0.0.0";
export ADMPWD="plokplok";
export THESITE="einvoice";




if [ "${BASH_SOURCE[0]}" -ef "$0" ]
then
	# echo -e "
 #  Steps from a completely raw install
 #  ...................................

 #  1. SSH stuff
 #        # Create directory and keys file
 #        mkdir ${HOME}/.ssh;
 #        chmod u+x,go-rwx ${HOME}/.ssh;

 #        # Place pub keys of workstations
 #        cat > ${HOME}/.ssh/authorized_keys

 #        <ctrl>-d


 #  2. APT house cleaning
 #        echo -e "\n    ********* Updating ********* \n\n";
 #        sudo -A apt -y update;

 #        echo -e "\n    ********* Upgrading ********* \n\n";
 #        sudo -A DEBIAN_FRONTEND=noninteractive apt -y upgrade;

 #        echo -e "\n ********* Dist Upgrading ********* \n\n";
 #        sudo -A apt -y dist-upgrade;

 #        echo -e "\n    ********* Cleaning ********* \n\n";
 #        sudo -A apt -y clean;

 #        echo -e "\n    ********* Removing ********* \n\n";
 #        sudo -A apt -y autoremove;



 #  ";

  echo -e "

	*** DANGER ***

	This is a tool that I use.  It MIGHT work for you.  I offer no guarantees of any kind.
	Personally I would NEVER use these 5 scripts on any machine containing anything I would not want to lose.



	*** PURPOSE ***

	These scripts prepare ERPNext on an Ubuntu Focal Fossa (20.04 LTS) virtual machine under QEMU/KVM.
	They might work on earlier versions.  I have not tried.



	*** USAGE ***
	Steps:
	 1. Create a new user for working with ERPNext, give it 'sudoer' privileges
        # Create user
        sudo adduser erpdev;

        # Add to sudoers
        sudo usermod -aG sudo erpdev;

        # Create directory and keys file
        mkdir ${HOME}/.ssh;
        chmod u+x,go-rwx ${HOME}/.ssh;

        # Place pub keys of workstations
        cat > ${HOME}/.ssh/authorized_keys

        <ctrl>-d
	 2. Put these files in that user's home directory, and run the command
	       # Make scripts executable
	       chmod +x ErpNextQikInstall*;
	 3. The scripts use 'sudo -A' so you'll need to set up 'SUDO_ASKPASS' (see below)
	 4. Execute script #0 to test if 'sudo -A' is working
	       ./ErpNextQikInstall_0.sh;
	 5. Execute script #1 to set up all of ERPNext's dependencies and install the 'bench' installer
	       ./ErpNextQikInstall_1.sh;
	 6. Log out and log back in again
	 7. Execute script #2 to set up your 'frappe-bench' directory
	       ./ErpNextQikInstall_2.sh;
	 8. Reboot the virtual machine
	 9. Execute script #3 to install the full 'frappe' application
	       ./ErpNextQikInstall_3.sh;
	10. Open up a second command line connection to your VM.
	11. Execute script #4 to create a new site install into it the 'ERPNext' application
	12. In the machine running the browser you'll use to work with ERPNext, be sure you have can reference it by name
	       Edit your file '/etc/hosts' to include the IP address and name of the machine where you installed everything.
	       192.168.122.99  mysite # ** EXAMPLE ***

	*** Notes ***
	1. You'll notice the files are divided into three sections by if ... elif ... else ... fi.
	   If you get part way through a script and are forced to stop and retry you can move the
	   successfully executed parts into the 'Skipped' section.
	2. The bits to do with 'sudo -A apt install -y ntpdate;' are to force correct date and time.
	   I use virtual machines with hot snapshot capability.  Reverting a snapshot will find the
	   date and time set to the time the snapshots was taken which will cause 'apt' to fail.


	*** SUDO_ASKPASS set up ***
	1. Append this text to your ${HOME}/.bashrc
	       export SUDO_ASKPASS=${HOME}/.ssh/.supwd.sh;

	2. Ensure you have a directory '${HOME}/.ssh'
	3. Create a file '${HOME}/.ssh/.supwd.sh' containing
	       #!/usr/bin/env bash
	       echo ' <your user's password goes here> ';
	4. Run this command:
	       chmod +x ${HOME}/.ssh/.supwd.sh
	5. The steps below test if you got it working.

	";

	read -n1 -r -p "Press <q>  to quit, any other to proceed..." key

	if [ "$key" = 'q' ]; then
	  echo -e "\nQuitting";
	  exit;
	fi;


	export WARNING_MSG="Warnings:";
	export WARNING="${WARNING_MSG}";

	export SSHDIR=".ssh";
	export SUPWDFILE=".supwd.sh";
	export SUPWDPATH="${HOME}/${SSHDIR}/${SUPWDFILE}";
	echo -e "
	Ensuring there is a '${SUPWDFILE}' executable for 'SUDO_ASKPASS'...";
	[ -f ${SUPWDPATH} ] || WARNING="${WARNING}\n  - ${SUPWDPATH} :: was not found";
	chmod u+x,go-rwx ${SUPWDPATH};


	export USERCTX=".bashrc";
	export ASKPASS_ENVVAR="export SUDO_ASKPASS=\${HOME}/.ssh/.supwd.sh";
	echo -e "
	Ensuring the 'SUDO_ASKPASS' environment variable will be exported at log in....${ASKPASS_ENVVAR}";
	cat ${HOME}/${USERCTX} | grep "${ASKPASS_ENVVAR}" >/dev/null || WARNING="${WARNING}\n  - SUDO_ASKPASS :: expected '${HOME}/${USERCTX}' to contain '${ASKPASS_ENVVAR}'.";
	source ${HOME}/${USERCTX};


	echo -e "
	Ensuring the 'SUDO_ASKPASS' env var has a value";
	[ -z "${SUDO_ASKPASS}" ] && WARNING="${WARNING}\n  - SUDO_ASKPASS :: expected 'SUDO_ASKPASS' to contain '${SUPWDPATH}'.";


	echo -e "
	Ensuring 'sudo -A command' actually works";
	sudo -A touch /scrap 2>/dev/null || WARNING="${WARNING}\n  - SUDO_ASKPASS :: Failed to run 'sudo -A command'.";
	sudo -A rm /scrap 2>/dev/null;


	echo -e "
	Ensuring ERPNext Administrator password 'ADMPWD' has been set.";
	[ -z "${ADMPWD}" ] && WARNING="${WARNING}\n  - ERPNext Administrator password 'ADMPWD' has no value set.";

	echo -e "
	Ensuring MariaDb root password 'MYPWD' has been set.";
	[ -z "${MYPWD}" ] && WARNING="${WARNING}\n  - MariaDb root password 'MYPWD' has no value set.";

	echo -e "
	Ensuring the name for your new site 'THESITE'  has been set.";
	[ "my site" = "${THESITE}" ] && WARNING="${WARNING}\n  - Name for your new site 'THESITE' has no VALID value set. [ '${THESITE}' ?? ]";


	if [[ "${WARNING}" != "${WARNING_MSG}" ]]; then
		echo -e "\n${WARNING}";
		echo -e "\n      To run these scripts you will need to understand how to get 'SUDO_ASKPASS' to work.";
		echo -e "      Try https://stackoverflow.com/questions/12608293/how-to-setup-a-sudo-askpass-environment-variable";
		echo -e "        Note: The preceding tests expect you'll use a file named '${SUPWDPATH}'";
		exit 1;
	else
	  echo -e "\n\nNo issues found";
	fi;
	echo -e ".....................";

fi