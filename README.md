global-splitter
===============

Splits a JavaScript file with multiple expression statements under one global into multiple files with CommonJS headers

Example
------

Given a file like

```javascript
First.File.Of.Many = function () {
    var something = {
        1: 3, 2: 4, 5: 9
    };
};

Another.File.Of.Others = {};

Third.File.Of.One = function () {
    var ff = $.find("123123.2");
};
```

Install via `npm install global-splitter`

Then run `./node_modules/.bin/global-splitter test/testdata.js`

This will create three files

__output/Many.js__
```javascript
'use strict';

module.exports = function () {
    var something = {
            1: 3,
            2: 4,
            5: 9
        };
}
```

__output/One.js__

```javascript
'use strict';

var $ = require('jquery');

module.exports = function () {
    var ff = $.find('123123.2');
}
```

__output/Others.js__

```javascript
'use strict';

module.exports = {}
```

Options
-------

* Can include footer file `includes/footer.hbs` which supports the following values:
    * `fileName` of the output file