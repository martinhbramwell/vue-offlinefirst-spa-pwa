#!/usr/bin/env python

import urllib2
import urllib
import hashlib
import hmac
import base64
import os
import sys
import json

baseurl=os.environ['IW_BASE_URL']
secretkey=os.environ['IW_API_SCRT']

request={}
request['apikey']=os.environ['IW_API_KEY']
request['response']='json'

request['command']='listVirtualMachines'
request['id']='e8c6e109-5a11-4229-809f-f0ff794813db'

# print (sys.argv[1])
with open(sys.argv[1]) as json_file:
    data = json.load(json_file)
# print (data['command'])
request.update(data)
"""
print(request)
exit()
"""

request_str='&'.join(['='.join([k,urllib.quote_plus(request[k])]) for k in request.keys()])

sig_str='&'.join(['='.join([k.lower(),urllib.quote_plus(request[k].lower().replace('+','%20'))])for k in sorted(request.iterkeys())])


sig=urllib.quote_plus(base64.encodestring(hmac.new(secretkey,sig_str,hashlib.sha1).digest()).strip())
# sig

req=baseurl+request_str+'&signature='+sig
# print req

"""
import urllib2
req='https://master.iwstack.com/client/api?apikey=VXZ8mbs8sZ23a52FHqUcytHt62CNWyAY8_-nKjnh3gaM2Qxz0lcdAA-w79ktSVMIM6AKe3ibp55NvmjY8JeCYQ&command=listVMSnapshot&response=json&signature=bVXRhC4lOPuk18STIXKwSzD8Tes%3D'
"""

res=urllib2.urlopen(req)
print res.read()



