'use strict';

var esprima = require('esprima');
var escodegen = require('escodegen');
var fs = require('fs');

var OUTPUT_FOLDER = 'output';

function getDirOf(file) {
    return process.cwd() + '/' + file;
}

var imports = [
    { name: 'underscore', usage: '_'},
    { name: 'backbone', usage: 'Backbone'},
    { name: 'jquery', usage: '$'},
    { name: 'marionette', usage: 'Marionette' },
    { name: 'd3', usage: 'd3' }
];

function getDependenciesFrom(contents) {
    return imports.reduce(function (memo, item) {
        if (contents.indexOf(item.usage + '.') >= 0 || contents.indexOf(item.usage + '(') >= 0) {
            memo += 'var ' + item.usage + ' = require(\'' + item.name + '\');\n';
        }
        return memo;
    }, '');
}

module.exports = function split(files) {
    var parsedFiles = files.map(function (file) {
        var script = fs.readFileSync(getDirOf(file));
        return esprima.parse(script);
    });

    if (!fs.existsSync(getDirOf(OUTPUT_FOLDER))) {
        fs.mkdirSync(getDirOf(OUTPUT_FOLDER));
    }

    parsedFiles.forEach(function (parseTree) {
        parseTree.body.filter(function (element) {
            var canSplit = 'expression' in element && element.expression.type === 'AssignmentExpression';
            if (!canSplit) {
                // TODO Should be output log
                console.log('Cannot split:\n\n' + escodegen.generate(element) + '\n\n');
            }
            return canSplit;
        }).forEach(function (node) {
            var fileName = node.expression.left.property.name;
            var fileContents = escodegen.generate(node.expression.right);
            fileContents = '\'use strict\';\n\n' + getDependenciesFrom(fileContents) + '\n\nmodule.exports = ' + fileContents;
            fs.writeFileSync(getDirOf(OUTPUT_FOLDER + '/' + fileName + '.js'), fileContents);
        });
    });
};