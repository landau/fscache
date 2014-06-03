"use strict";

var fs = require("fs"),
    path = require("path"),
    crypto = require("crypto");

var should = require("should");

var Cache = require(path.join("..", "lib", "cache"));
var dir = path.join(__dirname, "..", ".cache");

describe("Cache", function () {
    var dir = path.join(__dirname, "..", ".cache"),
        key = { foo: "bar" },
        hash = crypto.createHash("md5").update(JSON.stringify(key)).digest("hex"),
        filepath = path.join(dir, hash);

    beforeEach(function () {
        this.now = new Date();
    });

    afterEach(function () {
        var files = fs.readdirSync(dir)
        files.forEach(function (file) {
            fs.unlinkSync(path.join(dir, file));
        });
        fs.rmdirSync(dir);
    });

    describe("Sync methods", function () {
        beforeEach(function () {
            this.cache = Cache.createSync(50, dir);
            this.cache.putSync(key, key);
        });

        it("should make a directory to store cached files", function () {
            fs.existsSync(dir).should.equal(true);
            fs.statSync(dir).isDirectory().should.equal(true);
        });

        it("should save data to a file", function () {
            fs.existsSync(filepath).should.equal(true);
            fs.statSync(filepath).isFile().should.equal(true);
        });

        it("should retrieve cached data from a file", function () {
            var data = this.cache.getSync(key);
            data.foo.should.equal("bar");
        });

        it("should delete a cached file if it is exists", function () {
            this.cache.delSync(key);
            fs.existsSync(filepath).should.not.equal(true);
        });

        it("should delete a cached file if it is expired", function (done) {
            setTimeout(function () {
                var data = this.cache.getSync(key);
                should.not.exists(data);
                done();
            }.bind(this), 75);
        });

        it("should clean up all files", function () {
            this.cache.cleanSync();
            fs.readdirSync(dir).length.should.equal(0);
        });
    });

    describe("Async methods", function () {
        beforeEach(function (done) {
            Cache.create(50, dir, function (err, cache) {
                if (err) return done(err);
                this.cache = cache;
                this.cache.put(key, key, function (err) {
                    done(err);
                });
            }.bind(this));
        });

        it("should make a directory to store cached files", function () {
            fs.existsSync(dir).should.equal(true);
            fs.statSync(dir).isDirectory().should.equal(true);
        });

        it("should save data to a file", function () {
            fs.existsSync(filepath).should.equal(true);
            fs.statSync(filepath).isFile().should.equal(true);
        });

        it("should retrieve cached data from a file", function (done) {
            this.cache.get(key, function (err, data) {
                if (err) return done(err);
                data.foo.should.equal("bar");
                done();
            });
        });

        it("should delete a cached file if it is exists", function (done) {
            this.cache.del(key, function (err) {
                if (err) return done(err);
                fs.existsSync(filepath).should.not.equal(true);
                done();
            });
        });

        it("should delete a cached file if it is expired", function (done) {
            setTimeout(function () {
                this.cache.get(key, function (err, data) {
                    if (err) return done(err);
                    should.not.exists(data);
                    done();
                }.bind(this));
            }.bind(this), 75);
        });

        it("should clean up all files", function (done) {
            this.cache.clean(function (err) {
                if (err) return done(err);
                fs.readdirSync(dir).length.should.equal(0);
                done();
            });
        });
    });

    describe("Use different types for key/val", function () {
        beforeEach(function () {
            this.cache = Cache.createSync(50, dir);
        });

        it("should store with an object", function () {
            this.cache.putSync(key, key);
            var data = this.cache.getSync(key);
            data.foo.should.equal("bar");
        });

        it("should store with an array", function () {
            var key = [1,2,3];
            this.cache.putSync(key, key);

            var data = this.cache.getSync(key);
            data.length.should.equal(key.length);
        });

        it("should store with a string", function () {
            var key = "cache";
            this.cache.putSync(key, key);

            var data = this.cache.getSync(key);
            data.should.equal(key);
        });

        it("should store with a number", function () {
            var key = 9999;
            this.cache.putSync(key, key);

            var data = this.cache.getSync(key);
            data.should.equal(key);
        });
    });

    describe("Support ttl null", function() {
      beforeEach(function() {
        this.cache = Cache.createSync(dir);
        this.cache.putSync(key, key);
      });

      it("should make a directory to store cached files", function () {
          fs.existsSync(dir).should.equal(true);
          fs.statSync(dir).isDirectory().should.equal(true);
      });

      it("should save data to a file", function () {
          fs.existsSync(filepath).should.equal(true);
          fs.statSync(filepath).isFile().should.equal(true);
      });

      it("should retrieve cached data from a file", function () {
          var data = this.cache.getSync(key);
          data.foo.should.equal("bar");
      });
    });
});
