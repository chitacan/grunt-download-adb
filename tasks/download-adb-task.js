var http     = require('http')
  , xmldoc   = require('xmldoc')
  , path     = require('path')
  , os       = require('os')
  , fs       = require('fs')
  , url      = require('url')
  , unzip    = require('unzip')
  , Progress = require('progress')

module.exports = function(grunt) {
  var URL  = 'http://dl-ssl.google.com/android/repository/repository-8.xml'
    , TEMP = path.join(os.tmpdir(), 'download-adb');

  var LINUX = 'linux'
    , WIN   = 'windows'
    , OSX   = 'macosx'

  var PROGRESS_FMT = '  downloading [:bar] :percent :etas'
    , PROGRESS_OPT = {
      total      : 0,
      complete   : '=',
      incomplete : ' ',
      width      : 20
    }

  var platform = function(platform) {
    if (platform === 'win32')
      return WIN;
    else if (platform === 'darwin')
      return OSX;
    else
      return LINUX;
  }(process.platform);

  function getXml(res) {
    var self = this;
    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      self.binary = extractBinaryInfo(body);
      PROGRESS_OPT.total = parseInt(self.binary.size, 10),
      self.progress = new Progress(PROGRESS_FMT, PROGRESS_OPT);
      self.tempPath = path.join(self.tempDir, self.binary.url);

      if (grunt.file.exists(self.tempPath)) {
        extract.call(self);
      } else {
        var binUrl = url.resolve(self.url, self.binary.url);
        http.get(binUrl, download.bind(self));
      }
    });
    res.on('error', function() {
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

  function download(res) {
    var self = this;
    createDir(self.tempDir);
    var outputStream = fs.createWriteStream(self.tempPath);
    res.pipe(outputStream);
    res.on('data', function(chunk) {
      self.progress.tick(chunk.length);
    });
    res.on('end', function() {
      extract.call(self);
    });
    res.on('error', function(e) {
    });
  }

  function extract() {
    var self = this;
    var s = fs.createReadStream(self.tempPath);
    var d = unzip.Extract({ path: self.outputDir });

    s.pipe(d);
    s.on('end', function() {
      if (platform != 'win32') {
        var adbPath = grunt.file.expand(path.join(self.outputDir, '**', 'adb'));
        fs.chmodSync(adbPath[0], '755');
      }
      self.done();
    });
    s.on('error', function(e) {
    });
  }

  function createDir(path) {
    grunt.file.mkdir(path);
  }

  grunt.registerTask('download-adb', 'Download adb', function() {
    grunt.log.writeln('Download adb');
    var options = this.options({
      url      : URL,
      outputDir: 'bin',
      tempDir  : TEMP,
    });
    options.done = this.async();
    options.outputDir = path.join(process.cwd(), options.outputDir);
    createDir(options.outputDir);

    http.get(options.url, getXml.bind(options));
  });
}
