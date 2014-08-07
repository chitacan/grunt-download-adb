'use strict'

module.exports = function(grunt) {
  var URL  = 'http://dl-ssl.google.com/android/repository/'
    , REPO = 'repository-8.xml'

  var LINUX = 'linux'
    , WIN   = 'windows'
    , OSX   = 'macosx'

  grunt.registerTask('download-adb', 'Download adb', function() {
    grunt.log.writeln('Download adb');
  });
}
