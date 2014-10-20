"use strict";

var fs = require("fs"),
    path = require("path"),
    crypto = require("crypto"),
    async = require("async");


/*
 * @param {Number} ttl - how long to store a value. null will store forever
 *        default: null
 * @param {String} dir - Where to store data
 */
function Cache(ttl, dir) {
    this.ttl = ttl;
    this.dir = dir;
}

Cache.prototype = {
    // Creates a md5 hash based on the stringified arg
    _makeFilepath: function (arg) {
        var hash = crypto.createHash("md5")
            .update(JSON.stringify(arg))
            .digest("hex");
        return path.join(this.dir, hash);
    },


    /*
     * @visibility private
     * @param {Mixed} key - A JSON stringifiable value
     * @param {Mixed} val - a JSON stringifiable value
     * @param {Boolean} isSync - specifies which fs call to use
     * @param {Function} fn - A function called only if the value is async
     */
    _put: function (key, val, isSync, fn) {
        var filepath = this._makeFilepath(key);

        // Create cache key
        var cache = {
            ttl: this.ttl != null ? new Date(Date.now() + this.ttl) : null,
            data: val
        };

        var data = JSON.stringify(cache),
            method = isSync ? "writeFileSync" : "writeFile",
            args = [filepath, data, "UTF8", isSync ? null : fn];

        return fs[method].apply(fs, args);
    },

    put: function (key, val, fn) {
        return this._put(key, val, false, fn);
    },
    putSync: function (key, val) {
        return this._put(key, val, true, null);
    },

    /*
     * @param {Mixed} key - A JSON stringifiable key that is used to lookup
     *                      up a cached file
     */
    get: function (key, fn) {
        var self = this,
            filepath = this._makeFilepath(key);

        fs.exists(filepath, function (exists) {
            if (!exists) return fn();

            fs.readFile(filepath, "UTF8", function (err, data) {
                if (err) return fn(err);

                var cache = JSON.parse(data);

                if (!self._cacheIsValid(cache)) return self.del(key, fn);
                fn(null, cache.data);
            });

        });
    },

    /*
     * @desc - Synchronous get
     */
    getSync: function (key) {
        var filepath = this._makeFilepath(key);
        if (!fs.existsSync(filepath)) return;

        var cache = JSON.parse(fs.readFileSync(filepath), "UTF8");

        if (!this._cacheIsValid(cache))
            return this.delSync(key);

        return cache.data;
    },


    _cacheIsValid: function (cache) {
        // A cache of null lives forever
        if (cache.ttl == null) return true;
        if (new Date(cache.ttl) - new Date() > 0) return true;
        return false;
    },

    /*
     * @param {Mixed} key - A JSON stringifiable key that is used to lookup
     *                      up a cached file
     */
    del: function (key, fn) {
        var filepath = this._makeFilepath(key);
        fs.exists(filepath, function (exists) {
            if (!exists) return fn();
            fs.unlink(filepath, fn);
        });
    },

    /*
     * @desc - Synchronous del
     */
    delSync: function (key) {
        var filepath = this._makeFilepath(key);
        if (!fs.existsSync(filepath)) return;
        fs.unlinkSync(filepath);

    },

    /*
     * @desc Clears all cached values
     */
    clean: function (fn) {
        // Cleans all cache files
        var self = this;
        fs.readdir(this.dir, function (err, files) {
            if (err) return fn(err);
            var methods = files.map(function (file) {
                return function (_fn) {
                    fs.unlink(path.join(self.dir, file), function (err) {
                        _fn(err);
                    });
                };
            });
            async.parallel(methods, function (err) {
                fn(err);
            });
        });
    },

    /*
     * Synchronous clean
     */
    cleanSync: function () {
        // Cleans all cache files
        if (fs.existsSync(this.dir)) {
            var files = fs.readdirSync(this.dir);
            files.forEach(function (file) {
                fs.unlinkSync(path.join(this.dir, file));
            }.bind(this));
        }
    }
};


exports.Cache = Cache;

/*
 * @param {Number} ttl - This cache will live forever if ttl is null
 * @param {String} dir - Directory to store cached data
 */
exports.create = function (ttl, dir, fn) {
    if (typeof ttl == "string") {
      fn  = dir;
      dir = ttl;
      ttl = null;
    }

    fs.stat(dir, function(err, stats) {
        if (!err && stats.isDirectory()) {
            return fn(null, new Cache(ttl, dir));
        }
        fs.mkdir(dir, function (err) {
            if (err) return fn(err);
            return fn(null, new Cache(ttl, dir));
        });
    });
};

exports.createSync = function (ttl, dir) {
    if (typeof ttl == "string") {
      dir = ttl;
      ttl = null;
    }

    if (!(fs.existsSync(dir) && fs.statSync(dir).isDirectory())) {
        fs.mkdirSync(dir);
    }
    return new Cache(ttl, dir);
};
