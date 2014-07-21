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
    
    var _fetch = function(path, contentType, request, response) {
        var querystring = require('querystring');
        if (contentType.ext == '.html') {
            return _get(request, response, path.url);
        } else if (request && request.method === 'GET') {
            var str = path.url.split('?')[1];
            var parsedBody = str ? querystring.parse(str) : null;
            return _get(request, response, path.url, request.method, parsedBody);
        } else if (request && request.method === 'POST') {
            var chunkedData = '';
            request.on('data', function(chunk) {
                chunkedData += chunk.toString();
            });
            var decodedBody = querystring.parse(chunkedData);
            return _get(request, response, path.url, request.method, decodedBody);
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
        /*
        * Set file path
        * */
        , filePath = function(url) {
            var fPath;
            var ext = path.extname(url);
            if (!ext && url) {
                fPath = require(configYite.viewsRoutes)(url, viewsHTMLPaths);
            } else if (ext == '.js' || ext == '.css' || ext == '.html'|| ext == '.json') {
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
            var contentType = 'text/html';
            switch (extname) {
                case '.js':
                    contentType = 'text/javascript';
                    break;
                case '.css':
                    contentType = 'text/css';
                    break;
                case '.html':
                    contentType = 'text/html';
                    break;
            }
            return {
                ext: extname,
                contentType: contentType
            };
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
                var swig  = require('swig');
                renderContent = swig.renderFile(path, controllerFetch);
            }
            return renderContent;
        };
        var fPath = filePath(request.url)
          , contentType = setContentType()
          , controllerFetch = {};
        fs.exists(fPath.path, function(exists) {

            if (exists) {
                fs.readFile(fPath.path, 'utf8', function(error, content) {
                    if (error) {
                        response.writeHead(500);
                        response.end();
                    }
                    else {
                        if (contentType.ext == '.html') {
                            controllerFetch = _fetch(fPath, contentType, request, response);

                            content = setTemplateRenderedView(fPath.path, controllerFetch, content);
                        }
                        response.writeHead(200, { 'Content-Type': contentType.contentType });
                        response.end(content, 'utf-8');
                    }
                });
            } else if(!exists && contentType.ext !== '.js'&& contentType.ext !== '.css') {
                var fetchedResponse = _fetch(fPath, contentType, request, response);
                if (fetchedResponse) {
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify(fetchedResponse), 'utf-8');
                } else {
                    var contentError = setTemplateRenderedView(configYite.errorFilePath);
                    response.writeHead(200, { 'Content-Type': 'text/html' });
                    response.end(contentError, 'utf-8');
                }
            } else {
                response.writeHead(404);
                response.end();
            }
        });
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