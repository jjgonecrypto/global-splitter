'use strict';

var esprima = require('esprima');
var escodegen = require('escodegen');
var fs = require('fs');
var handlebars = require('handlebars');

var OUTPUT_FOLDER = 'output';

function getDirOf(file) {
    return process.cwd() + '/' + file;
}

var imports = [
    { name: 'underscore', usage: '_'},
    { name: 'backbone', usage: 'Backbone'},
    { name: 'jquery', usage: '$'},
    { name: 'backbone.marionette', usage: 'Marionette' },
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

function getInclude(fileName, context) {
    var path = __dirname + '/../includes/' + fileName;
    if (!fs.existsSync(path)) {
        return '';
    }
    var fileContents = fs.readFileSync(path, { encoding: 'utf8' });
    var template = handlebars.compile(fileContents);
    return '\n\n' + template(context);
}

module.exports = function split(files) {
    var splitIssues = [];
    function logError(errorMsg) {
        splitIssues.push(errorMsg);
        console.log(errorMsg + '\n\n');
    }
    var parsedFiles = files.filter(function (file) {
        if (!fs.existsSync(getDirOf(file))) {
            logError('ERROR - File does not exist: ' + file);
            return false;
        }
        return true;
    }).map(function (file) {
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
                logError('Cannot split:\n\n' + escodegen.generate(element));
            }
            return canSplit;
        }).forEach(function (node) {
            var fileName = node.expression.left.property.name;
            var fileNameLowered = fileName.slice(0, 1).toLowerCase() + fileName.slice(1);
            var fileContents = escodegen.generate(node.expression.right);
            fileContents = '\'use strict\';\n\n' + getDependenciesFrom(fileContents) + '\n\nmodule.exports = ' + fileContents + ';';
            fileContents += getInclude('footer.hbs', { fileName: fileName });
            fs.writeFileSync(getDirOf(OUTPUT_FOLDER + '/' + fileNameLowered + '.js'), fileContents);
        });
    });

    if (splitIssues.length) {
        fs.writeFileSync(getDirOf(OUTPUT_FOLDER + '/splitter.log'), splitIssues.join('\n\n'));
    }
};