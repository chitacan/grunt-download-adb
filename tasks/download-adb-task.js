'use strict'

var http   = require('http')

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

  grunt.registerTask('download-adb', 'Download adb', function() {
    grunt.log.writeln('Download adb');
  });
}
