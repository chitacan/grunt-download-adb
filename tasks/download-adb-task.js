'use strict'

var http   = require('http')
  , xmldoc = require('xmldoc')

module.exports = function(grunt) {
  var URL  = 'http://dl-ssl.google.com/android/repository/'
    , REPO = 'repository-8.xml'

  var LINUX = 'linux'
    , WIN   = 'windows'
    , OSX   = 'macosx'

  var platform = function(platform) {
    if (platform === 'win32')
      return WIN;
    else if (platform === 'darwin')
      return OSX;
    else
      return LINUX;
  }(process.platform);

  function getXml(url, callback) {
    http.get(url, function(res) {
      var body = '';
      res.on('data', function(chunk) {
        body += chunk;
      });
      res.on('end', function() {
        callback(undefined, body);
      });
    }).on('error', function(e) {
      callback(e);
    });
  }

  function extractBinaryInfo(xml) {
    var doc  = new xmldoc.XmlDocument(xml);
    var node = doc.childNamed('sdk:platform-tool')
                  .childNamed('sdk:archives')
                  .childWithAttribute('os', platform);
    return {
      'checksum' : node.valueWithPath('sdk:checksum'),
      'size'     : node.valueWithPath('sdk:size'),
      'url'      : node.valueWithPath('sdk:url')
    }
  }

  grunt.registerTask('download-adb', 'Download adb', function() {
    grunt.log.writeln('Download adb');
  });
}
