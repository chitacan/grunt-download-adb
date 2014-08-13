var http   = require('http')
  , xmldoc = require('xmldoc')
  , path   = require('path')
  , os     = require('os')
  , fs     = require('fs')
  , url    = require('url')
  , Progress = require('progress')

module.exports = function(grunt) {
  var URL  = 'http://dl-ssl.google.com/android/repository/repository-8.xml'
    , TEMP = path.join(os.tmpdir(), 'download-adb');

  var LINUX = 'linux'
    , WIN   = 'windows'
    , OSX   = 'macosx'

  var PROGRESS_FMT = '  downloading [:bar] :percent :etas'
    , PROGRESS_OPT = {
      total: 0,
      complete: '=',
      incomplete: ' ',
      width: 20
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

      var binUrl = url.resolve(self.url, self.binary.url);
      http.get(binUrl, download.bind(self));
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
    try {
      fs.mkdirSync(self.tempDir);
    } catch(e) {
    }

    var tempPath = path.join(self.tempDir, self.binary.url);
    var outputStream = fs.createWriteStream(tempPath);
    res.pipe(outputStream);
    res.on('data', function(chunk) {
      self.progress.tick(chunk.length);
    });
    res.on('end', function() {
      var dst = path.join(process.cwd(), self.outputDir, self.binary.url);
      move.call(self, tempPath, dst);
    });
    res.on('error', function(e) {
    });
  }

  function move(src, dst) {
    var self = this;
    var s = fs.createReadStream(src);
    var d = fs.createWriteStream(dst);

    s.pipe(d);
    s.on('end', function() {
      self.done();
    });
    s.on('error', function(e) {
    });
  }

  grunt.registerTask('download-adb', 'Download adb', function() {
    grunt.log.writeln('Download adb');
    var options = this.options({
      url      : URL,
      outputDir: 'bin',
      tempDir  : TEMP,
    });
    options.done = this.async();

    http.get(options.url, getXml.bind(options));
  });
}
