'use strict';

var splitter = require('../lib/splitter');
var expect = require('chai').expect;
var fs = require('fs');

describe('global splitter', function () {

    it('must split testdata into three files', function () {
        splitter(['test/testdata.js']);

        var firstFile = fs.readFileSync(__dirname + '/../output/Many.js');
        expect(firstFile.toString().replace(/[\s]/g, '')).to.equal("'usestrict';module.exports=function(){varsomething={1:3,2:4,5:9};}");

        var secondFile = fs.readFileSync(__dirname + '/../output/One.js');
        expect(secondFile.toString().replace(/[\s]/g, '')).to.equal("'usestrict';var$=require('jquery');module.exports=function(){varff=$.find('123123.2');}");

        var thirdFile = fs.readFileSync(__dirname + '/../output/Others.js');
        expect(thirdFile.toString().replace(/[\s]/g, '')).to.equal("'usestrict';module.exports={}");
    });
});