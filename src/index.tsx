const http = require('http');
http.ServerResponse = class {};
http.IncomingMessage = class {};
require('./loader');
