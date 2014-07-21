
var http = require('http');
var lite = require('../lib/lite');

lite.config({
    templateEngine: 'swig',
    errorFilePath: __dirname + '/views/error.html',
    controller: __dirname + '/controller',
    viewsRoutes: __dirname + '/view-paths'
});

http.createServer(function (request, response) {
    lite.init(request, response);
}).listen(3000);
console.log('Server running at http://127.0.0.1:3000/');