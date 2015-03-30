#!/usr/bin/python

import SimpleHTTPServer
import SocketServer

PORT = 8000

Handler = SimpleHTTPServer.SimpleHTTPRequestHandler

httpd = SocketServer.TCPServer(("", PORT), Handler)

print("Serving cdb-manager at http://localhost:%d" % PORT)
httpd.serve_forever()
