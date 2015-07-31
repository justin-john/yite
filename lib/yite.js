/**
 * An internal router for Yite
 *
 * @param {Object} request
 * @param {Object} response
 * @api public
 */

module.exports = (function(request, response) {
    var configYite;
    var _get = function (request, response, url, reqMethod, params) {
        var controller = require(configYite.controller);
        var funName = url.split('/')[1];
        var resp;
        if (reqMethod === 'GET' && funName.indexOf('?') > -1) {
            funName = funName.split('?')[0];
        }
        if (url === '/') {
            funName = 'index';
        }
        if (funName && typeof controller[funName] === 'function') {
            resp = controller[funName](reqMethod, params, request, response);
        }
        return resp;
    };

    var _fetchParsedBody =  function (path, request) {
        var querystring = require('querystring');
        var str = path.url.split('?')[1];
        return str ? querystring.parse(str) : null;
    };

    var _fetchDecodedBody =  function (path, request, response) {
        var querystring = require('querystring');
        var chunkedData = '';
        request.isStreamEmitOnData = true;
        request.on('data', function(chunk) {
            chunkedData += chunk.toString();
        }).on('end', function() {
            return _get(request, response, path.url, request.method, querystring.parse(chunkedData));
        });
    };

    var _fetch = function(path, contentType, request, response) {
        if (contentType.ext == '.html') {
            var _fetchBodyParams;
            if (request && request.method === 'GET') {
                return _get(request, response, path.url, request.method,  _fetchParsedBody(path, request));
            } else if (request && request.method === 'POST') {
                return _fetchDecodedBody(path, request, response);
            }				
        } else if (request && request.method === 'GET') {
            return _get(request, response, path.url, request.method, _fetchParsedBody(path, request));
        } else if (request && request.method === 'POST') {
            return _fetchDecodedBody(path, request, response);
        } else {
            return {};
        }
    };

    var viewsHTMLPaths = {
      set: function(key, viewObjPaths) {
         return (key in viewObjPaths) ? viewObjPaths[key] : configYite.errorFilePath;
      }  
    };

    /*
    * Initialize the router
    *
    * @param {Object} request
    * @param {Object} response
    * */
    var _init = function(request, response) {
        if (!this.configInitialized) {
            _config();
        }

        var fs = require('fs')
        , path = require('path')
        , typeModule = require('./type')
        /*
        * Set file path
        * */
        , filePath = function(url) {
            var fPath;
            var ext = path.extname(url);
            if (!ext && url) {
                fPath = require(configYite.viewsRoutes)(url, viewsHTMLPaths);
            } else {
                fPath = url;
            }
            return {
                path: '.' + fPath,
                url: url
            };
        }
        /*
        * Set content type
        * */
        , setContentType = function () {
            var extname = path.extname(filePath(request.url).path);
            return typeModule.getType(extname);
        },
        /*
        * Set the template engine, defaults to swig.
        * */
        setTemplateRenderedView = function (path, controllerFetch, content) {
            var renderContent;
            switch (configYite.templateEngine) {
                case 'swig':
                var swig  = require('swig');
                renderContent = swig.renderFile(path, controllerFetch);
                break;
                case 'ejs':
                var ejs  = require('ejs');
                content = content || fs.readFileSync(path, 'utf8');
                renderContent = ejs.render(content, controllerFetch);
                break;
                case 'jade':
                var jade = require('jade');
                renderContent = jade.renderFile(path, controllerFetch);
                break;
                default:
                renderContent = fs.readFileSync(path, 'utf8');
            }
            return renderContent;
        };
        var fPath = filePath(request.url)
          , contentType = setContentType()
          , controllerFetch = {};
        fs.exists(fPath.path, function(exists) {
            if (exists) {
                fs.readFile(fPath.path, contentType.encoding || 'utf8', function(error, data) {
                    if (error) {
                        response.writeHead(500);
                        response.end();
                    }
                    else {
                        if (contentType.ext == '.html') {
                            controllerFetch = _fetch(fPath, contentType, request, response);

                            data = setTemplateRenderedView(fPath.path, controllerFetch, data);
                        }
                        var resWrite = function () {
                            response.writeHead(200, { 'Content-Type': contentType.contentType });
                            response.end(data, contentType.encoding || 'utf8');
                        }
                        request.isStreamEmitOnData ? request.on('end', function() { resWrite(); }) : resWrite();

                    }
                });
            } else if(!exists && contentType.ext !== '.js'&& contentType.ext !== '.css') {
                var fetchedResponse = _fetch(fPath, contentType, request, response);
                var resWrite = function () {
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify(fetchedResponse), 'utf-8');
                }
                if (fetchedResponse) {
                    request.isStreamEmitOnData ? request.on('end', function() { resWrite(); }) : resWrite();
                } else {
                    var contentError = setTemplateRenderedView(configYite.errorFilePath);
                    var resWrite = function () {
                        response.writeHead(200, { 'Content-Type': 'text/html' });
                        response.end(contentError, 'utf-8');
                    }
                    request.isStreamEmitOnData ? request.on('end', function() { resWrite(); }) : resWrite();
                }
            } else {
                response.writeHead(404);
                response.end();
            }
        });

        /*
         * Request and Response Methods
         * */
        response.getParsedFileData = setTemplateRenderedView;                
    },
    /*
    * Set config method
    *  
    * @param {Object} config
    * */
    _config = function (config) {
        this.configInitialized = true;
        config = config || {};
        configYite = {
            templateEngine: config.templateEngine,
            errorFilePath: config.errorFilePath || process.cwd() + '/views/error.html',
            controller: config.controller || process.cwd() + '/controller',
            viewsRoutes: config.viewsRoutes || process.cwd() + '/view-paths'
        };
    };

    return {
        configInitialized: false,
        config: _config,
        init: _init
    }
})();