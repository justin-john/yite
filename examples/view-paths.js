module.exports = function (url, viewsHTMLPaths) {
    var routeHTMLs = {
        '/'     : '/views/index.html',
        '/add'  : '/views/add.html',
        '/home' : '/views/home.html'
    };
    return viewsHTMLPaths.set(url, routeHTMLs);
};