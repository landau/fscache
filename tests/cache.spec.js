"use strict";

var fs = require("fs"),
    path = require("path"),
    crypto = require("crypto");

var should = require("should");

var Cache = require(path.join("..", "lib", "cache"));

describe("Cache", function () {
    var dir = path.join(__dirname, "..", ".cache"),
        key = { foo: "bar" },
        hash = crypto.createHash("md5").update(JSON.stringify(key)).digest("hex"),
        filepath = path.join(dir, hash);

    beforeEach(function () {
        this.cache = new Cache(50);
        this.now = new Date();
    });

    afterEach(function () {
        var files = fs.readdirSync(dir)
        files.forEach(function (file) {
            fs.unlinkSync(path.join(dir, file));
        });
        fs.rmdirSync(dir);
    });

    it("should make a directory to store cached files", function () {
        fs.existsSync(dir).should.equal(true);
        fs.statSync(dir).isDirectory().should.equal(true);
    });

    describe("Sync methods", function () {

        it("should save data to a file", function () {
            this.cache.putSync(key, key);
            fs.existsSync(filepath).should.equal(true);
            fs.statSync(filepath).isFile().should.equal(true);
        });

        it("should retrieve cached data from a file", function () {
            this.cache.putSync(key, key);
            fs.existsSync(filepath).should.equal(true);
            var data = this.cache.getSync(key);
            data.foo.should.equal("bar");
        });

        it("should delete a cached file if it is exists", function () {
            this.cache.putSync(key, key);
            this.cache.delSync(key);
            fs.existsSync(filepath).should.not.equal(true);
        });

        it("should delete a cached file if it is expired", function (done) {
            this.cache.putSync(key, key);
            setTimeout(function () {
                var data = this.cache.getSync(key);
                should.not.exists(data);
                done();
            }.bind(this), 75);
        });

        it("should clean up all files", function () {
            this.cache.putSync(key, key);
            Cache.cleanSync();
            fs.readdirSync(dir).length.should.equal(0);
        });
    });

    describe("ASync methods", function () {

        it("should save data to a file", function () {
            this.cache.putSync(key, key);
            fs.existsSync(filepath).should.equal(true);
            fs.statSync(filepath).isFile().should.equal(true);
        });

        it("should retrieve cached data from a file", function () {
            this.cache.putSync(key, key);
            fs.existsSync(filepath).should.equal(true);
            var data = this.cache.getSync(key);
            data.foo.should.equal("bar");
        });

        it("should delete a cached file if it is exists", function () {
            this.cache.putSync(key, key);
            this.cache.delSync(key);
            fs.existsSync(filepath).should.not.equal(true);
        });

        it("should delete a cached file if it is expired", function (done) {
            this.cache.putSync(key, key);
            setTimeout(function () {
                var data = this.cache.getSync(key);
                should.not.exists(data);
                done();
            }.bind(this), 75);
        });

        it("should clean up all files", function () {
            this.cache.putSync(key, key);
            Cache.cleanSync();
            fs.readdirSync(dir).length.should.equal(0);
        });
    });
});
