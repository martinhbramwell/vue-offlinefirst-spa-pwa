# vue-offlinefirst-sp-pwa  (offsppwa-vue)
A Vue JS starter kit for an Offline-First, Single Page, Progressive Web App.


## Server Setup

### DNS configuration

Using [Cloudflare](https://dash.cloudflare.com/7d8c5ff8bafa58452b55471cee8b20a6/iridium.blue/dns), create two A records: one for CouchDB and the other for the CouchDB supervisor.
CouchDB requires DNS only.
Supervisor can have DNS with HTTP proxy.

![Cloudflare Settings](https://i.imgur.com/j8B9qDH.png)

### Prepare configuration

Call the lambda app at [http://bit.ly/vue-offlinefirst-spa-pwa](http://bit.ly/vue-offlinefirst-spa-pwa) for instructions on downloading initial configuration.
Adjust as necessary.

You'll need to specify either 'PRD' OR 'DEV' for production or development respectively

Verify you can log into the CouchDB host with
```shell
echo "Stored password is : ${COUCH_PWD}";
ssh ${COUCH_ADM}@${COUCH_HOST};
```

### Run the script
```shell
pushd /packages/tools/ServerSetUp
```

### Remote debugging
```shell
ssh -L 9221:localhost:9229 you@tstvm01

# In chrome go to URL :
#     chrome://inspect/#devices
#
# Then : select "Open dedicated DevTools for Node"
#   - Menu >> Connection
#   - [Add Connection]
#   - 127.0.0.1:9221
#
# shell output trace will then show ...
Debugger attached.
```
