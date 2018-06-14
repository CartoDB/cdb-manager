#!/usr/bin/python
import sys
PORT = 8000

if sys.version_info >= (3, 0):
	import http.server
	import socketserver
	Handler = http.server.SimpleHTTPRequestHandler
	httpd = socketserver.TCPServer(("", PORT), Handler)
else:
	import SimpleHTTPServer
	import SocketServer
	Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
	httpd = SocketServer.TCPServer(("", PORT), Handler)

print("Serving cdb-manager at http://localhost:%d" % PORT)
httpd.serve_forever()
