'use strict';
/**
 * @file z test
 * @module mongodb-restore
 * @subpackage test
 * @version 0.0.1
 * @author hex7c0 <hex7c0@gmail.com>
 * @license GPLv3
 */

/*
 * initialize module
 */
// import
var client = require('mongodb').MongoClient;
var fs = require('fs');
// load
var URI = process.env.URI;

/*
 * test module
 */
describe('last', function() {

  var ROOT = __dirname + '/dump/';

  describe('tar', function() {

    it('should unlink tar file', function(done) {

      fs.unlink(ROOT + 't1.tar', function() {

        done();
      });
    });
  });

  describe('directory', function() {

    function rmDir(path, next) {

      fs.readdirSync(path).forEach(function(first) { // database

        var database = path + first;
        if (fs.statSync(database).isDirectory() === false) {
          return;
        }
        var metadata = '';
        var collections = fs.readdirSync(database);
        if (fs.existsSync(database + '/.metadata') === true) {
          metadata = database + '/.metadata/';
          delete collections[collections.indexOf('.metadata')]; // undefined is not a dir
        }
        collections.forEach(function(second) { // collection

          var collection = database + '/' + second;
          if (fs.statSync(collection).isDirectory() === false) {
            return;
          }
          fs.readdirSync(collection).forEach(function(third) { // document

            var document = collection + '/' + third;
            if (next !== undefined) {
              next(null, document);
            }
            fs.unlinkSync(document);
          });
          if (metadata !== '') {
            fs.unlinkSync(metadata + second);
          }
          fs.rmdirSync(collection);
        });
        if (metadata !== '') {
          fs.rmdirSync(metadata);
        }
        fs.rmdirSync(database);
      });
    }

    it('should rm db directory', function(done) {

      rmDir(ROOT);
      done();
    });
  });

  describe('end', function() {

    it('should drop database for next test', function(done) {

      client.connect(URI, function(err, db) {

        db.dropDatabase(function(err, collection) {

          db.close();
          done();
        });
      });
    });
  });
});
