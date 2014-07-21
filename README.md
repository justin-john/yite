Lite<sub><sub>Web Framework for Node.js</sub></sub>
=====


A lite web framework for Node.js called Lite. This framework helps to create web pages and web applications with Javascript in Controller-View Pattern.

## Installation

```bash
$ npm install lite
```

## Get Started

#####  app.js
```javascript
var http = require('http');
var lite = require('lite');

lite.config({
  templateEngine: 'swig',
  errorFilePath: __dirname + '/views/error.html',
  controller: __dirname + '/controller',
  viewsRoutes: __dirname + '/view-paths'
});

http.createServer(function (request, response) {
  lite.init(request, response);
}).listen(3000);
```

The application will listen on 3000.
The `lite` will use some configs to set the application. It will set template engine, controller file path, viewRoutes file path, error file path etc in application. The lite supports swig, jade and ejs template engines.

##### controller.js
```javascript
module.exports = (function () {
  var _index = function(reqMethod, params) {
    return {
      pagename: 'awesome people',
      authors: ['Paul', 'Jim', 'Jane']
    };
  }, _add = function(reqMethod, params) {
    return {
      pagename: 'awesome people',
      authors: ['Paul', 'Jim', 'Jane']
    };
  };

  return {
    index: _index,
    add: _add,
  }
})();
```
The controller file will return method to each request. Each method will have first argument as request method(GET or POST) and second argument as parameters passed in GET and POST request. Two more arguments(request and response objects) are given optionally, if end user needs any alternation in request and response handling.
For example, The `http://localhost:3000/add` request url will attach to `add` method in controller. We should specify the each method in controller file for each request(GET & POST).
We can override the default controller file path in lite configs.

##### view-paths.js
```javascript
module.exports = function (url, viewsHTMLPaths) {
  var routeHTMLs = {
    '/'     : '/views/index.html',
    '/add'  : '/views/add.html',
    '/home' : '/views/home.html'
  };
  return viewsHTMLPaths.set(url, routeHTMLs);
};
```
The view-paths file is used to map request route to HTML file.
For example, The `http://localhost:3000/add` will attach to `add.html` HTML file in views.
We can override the default view-paths file in lite configs.

By using above files we can start to create an application.

An demo application is given with examples.

Lite is still an experimental version.
Want to improve the lite stuff, please don't hesitate. Make a [Pull Request](https://github.com/justin-john/lite/pulls) or create an [issue](https://github.com/justin-john/lite/issues).

## License

The MIT License (MIT)

Copyright (c) 2014 Justin John Mathews <justinjohnmathews@gmail.com>