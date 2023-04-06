(window as any).process = require('process/browser');
const http = require('http');
http.ServerResponse = class {};
http.IncomingMessage = class {};
require('./loader');
