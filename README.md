Yite<sub><sub>Web Framework for Node.js</sub></sub>
=====


A lite web framework for Node.js called Yite. This framework helps to create web pages and web applications with Javascript in Controller-View Pattern.

## Installation

```bash
$ npm install yite
```

## Get Started

#####  app.js
```javascript
var http = require('http');
var yite = require('yite');

yite.config({
  templateEngine: 'swig',
  errorFilePath: __dirname + '/views/error.html',
  controller: __dirname + '/controller',
  viewsRoutes: __dirname + '/view-paths'
});

http.createServer(function (request, response) {
  yite.init(request, response);
}).listen(3000);
```

The yite application will listen on port 3000.
The `yite` will use some configs to set the application. It will set template engine, controller file path, viewRoutes file path, error file path etc in application. The yite supports [swig](http://paularmstrong.github.io/swig), [jade](http://jade-lang.com/) and [ejs](http://embeddedjs.com/) template engines. The npm module of template engine needs to required/installed in your application.
All filename(controller.js, view-paths.js) can be changed to your convenience.

If no yite configs are given, it will take the defaults values, which are same as above given yite configs. 

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
We can override the default controller file path in yite configs.

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
We can override the default view-paths file in yite configs.

By using above files we can start to create an application.

In examples folder of this repo, there is an example usage of yite in an application.

### Working of Yite

When user access a route(request url) like "localhost:3000/home", the request first passes to controller's method `home` in `controller.js` and return the response as json. But if we need to render a html page for corresponding route, then it needs to add map route in `view-paths.js` file. This will lead to parse the controller's json response into view html file using template engines. The final output will be locals object parsed in raw html.

#### Some routing examples

| URL                    | Request Method  | Controller Method | View Path Map                     | Explanation                                                                                                                                                                                                                                                          |
|------------------------|:----------------|-------------------|:----------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|
| localhost:3000         | GET             |             index | '/'     : '/views/index.html'     | The route will check controller have method called `index`. The response is raw html which will be rendered with parsing json object from method |
| localhost:3000/add     | POST            |               add |                                   | The route will check controller have method called `add`. It will return response as json object as no view mapping is given. |
| localhost:3000/home    | GET             |              home | '/home' : '/views/home.html'      | The route will check controller have method called `home`. The view html will be rendered with parsing json object from method . |
| localhost:3000/contact | GET/POST        |           contact | '/home' : '/views/contact.html'   | The route will check controller have method called `contact`. The view html will be rendered with parsing json object from method .  |
| localhost:3000/contact | GET/POST        |           contact |                                   | The route will check controller have method called `contact`. It will return response as json object.  |

### Relases Notes
Yite is still an experimental version. 

Want to improve the yite stuff, please don’t hesitate to fork and make a [Pull Request](https://github.com/justin-john/yite/pulls). If you have any questions, thoughts, concerns or feedback, please don't hesitate to create an [issue](https://github.com/justin-john/yite/issues).
Your suggestions are always welcome!

## License

The MIT License (MIT)

Copyright (c) 2014 Justin John Mathews <justinjohnmathews@gmail.com>
