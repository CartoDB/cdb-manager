#!/usr/bin/python

import http.server
import socketserver 

PORT = 8000

Handler = http.server.SimpleHTTPRequestHandler

httpd = socketserver.TCPServer(("", PORT), Handler)

print("Serving cdb-manager at http://localhost:%d" % PORT)
httpd.serve_forever()
