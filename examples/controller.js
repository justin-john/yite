module.exports = (function () {
    var _index = function(reqMethod, params) {
        return {
            test: 'testcvc',
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
    };

    return {
        index: _index,
        add: _add,
        test: _test
    }
})();