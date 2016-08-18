var assert = require('assert')
var fs = require('fs')
var path = require('path')
var rcedit = require('..')
var rcinfo = require('rcinfo')
var temp = require('temp').track()

var beforeEach = global.beforeEach
var describe = global.describe
var it = global.it

describe('rcedit(exePath, options, callback)', function () {
  this.timeout(60000)

  var exePath = null
  var tempPath = null

  beforeEach(function () {
    tempPath = temp.mkdirSync('node-rcedit-')
    exePath = path.join(tempPath, 'electron.exe')
    var fixturesExePath = path.join(__dirname, 'fixtures', 'electron.exe')
    fs.writeFileSync(exePath, fs.readFileSync(fixturesExePath))
  })

  it('updates the information in the executable', function (done) {
    var options = {
      'version-string': {
        CompanyName: 'Umbrella',
        FileDescription: 'Vanhouten',
        LegalCopyright: 'Maritime',
        ProductName: 'Millhouse'
      },
      'file-version': '3.4.5.6',
      'product-version': '4.5.6.7',
      icon: path.join(__dirname, 'fixtures', 'app.ico')
    }

    rcedit(exePath, options, function (error) {
      if (error != null) return done(error)

      rcinfo(exePath, function (error, info) {
        if (error != null) return done(error)

        assert.equal(info.CompanyName, 'Umbrella')
        assert.equal(info.FileDescription, 'Vanhouten')
        assert.equal(info.LegalCopyright, 'Maritime')
        assert.equal(info.ProductName, 'Millhouse')
        assert.equal(info.FileVersion, '3.4.5.6')
        assert.equal(info.ProductVersion, '4.5.6.7')

        done()
      })
    })
  })

  it('supports non-ASCII characters in the .exe path', function (done) {
    var unicodePath = path.join(path.dirname(exePath), 'äeiöü.exe')
    fs.renameSync(exePath, unicodePath)

    var options = {
      'version-string': {
        FileDescription: 'foo',
        ProductName: 'bar'
      },
      'file-version': '8.0.8'
    }

    rcedit(unicodePath, options, function (error) {
      if (error != null) return done(error)
      done()
    })
  })

  it('supports a product version of 1', function (done) {
    var options = {
      'product-version': '1'
    }

    rcedit(exePath, options, function (error) {
      if (error != null) return done(error)

      rcinfo(exePath, function (error, info) {
        if (error != null) return done(error)

        assert.equal(info.ProductVersion, '1.0.0.0')

        done()
      })
    })
  })

  it('supports a product version of 1.0', function (done) {
    var options = {
      'product-version': '1.0'
    }

    rcedit(exePath, options, function (error) {
      if (error != null) return done(error)

      rcinfo(exePath, function (error, info) {
        if (error != null) return done(error)

        assert.equal(info.ProductVersion, '1.0.0.0')

        done()
      })
    })
  })

  it('reports an error when the .exe path does not exist', function (done) {
    rcedit(path.join(tempPath, 'does-not-exist.exe'), {'file-version': '3.4.5.6'}, function (error) {
      assert.ok(error instanceof Error)
      assert.equal(error.message, 'rcedit.exe failed with exit code 1. Fatal error: Unable to load file')

      done()
    })
  })
})
