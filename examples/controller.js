module.exports = (function () {
    var _index = function(reqMethod, params) {
        return {
            test: 'test cvc',
            users: ['Gewrt', 'Jim', 'Jane']
        };
    },_add = function(reqMethod, params) {
        return {
            pagename: 'awesome people',
            authors: ['Paul', 'Jim', 'Jane']
        };
    }, _test = function(reqMethod, params) {
        return {
            pagename: 'awesome people',
            authors: ['Paul', 'Jim', 'Jane']
        };
    }, _contact = function(reqMethod, params, req, res) {
        var locals = {
            pagename: 'awesome people',
            authors: ['Justin', 'John', 'Mathews']
        };
        var data = res.getParsedFileData('views/home.html', locals);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data, 'utf-8');
    };

    return {
        index: _index,
        add: _add,
        test: _test,
        contact: _contact
    }
})();