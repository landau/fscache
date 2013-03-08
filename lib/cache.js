var fs = require("fs"),
    path = require("path"),
    crypto = require("crypto"),
    __slice = Array.prototype.slice;

var dir = path.join(__dirname, "..", ".cache");

function Cache(ttl) {
    // This cache will live forever if ttl is null
    if (typeof ttl !== "number") ttl = null;
    this.ttl = ttl;

    if (!(fs.existsSync(dir) && fs.statSync(dir).isDirectory())) {
        fs.mkdirSync(dir);
    }
}

Cache.prototype = {
    // TODO documentation
    _makeHash: function (arg) {
        return crypto.createHash("md5")
            .update(JSON.stringify(arg))
            .digest("hex");
    },


    // TODO documentation
    _put: function (key, val, isSync, fn) {
        var hash = this._makeHash(key);

        // Create cache key
        var cache = {
            ttl: new Date(Date.now() + this.ttl),
            data: val
        };

        var filepath = path.join(dir, hash),
            data = JSON.stringify(cache),
            method = isSync ? "writeFileSync" : "writeFile",
            args = __slice.call(arguments);

        // add/Replace 3rd arg with utf8 for fs call
        args.splice(2, 1, "UTF8");

        fs[method].apply(fs, args);
    },

    // TODO documentation
    _get: function (key, isSync, fn) {
        var hash = this._makeHash(key),
            filepath = path.join(dir, hash);

        return isSync ? this._getSync(key, filepath) : this._getAsync(key, filepath, fn);
    },

    _getSync: function (key, filepath) {
        if (!fs.existsSync(filepath)) return;

        var cache = JSON.parse(fs.readFileSync(filepath), "UTF8");

        if (!this._cacheIsValid(cache))
            return this._del(key, true);

        return cache.data;
    }

    _getAsync: function (key, filepath, fn) {
        var self = this;
        fs.exists(function (exists) {
            if (!exists) return fn();

            fs.readFile(filepath, "UTF8", function (err, data) {
                if (err) return fn(err);

            var cache = JSON.parse(data);

            if (!self._cacheIsValid(cache))
                return self._del(key, false, fn);
            });

            fn(null, cache.data);
        });
    }

    _cacheIsValid: function (cache) {
        // A cache of null lives forever
        if (cache.ttl == null) return true;
        if (new Date(cache.ttl) - new Date() > 0) return true;
        return false;
    }

    // TODO documentation
    _del: function (key, isSync, fn) {
        var hash = this._makeHash(key),
            filepath = path.join(dir, hash);

        return isSync ? this._delSync(key, filepath) : this._delAsync(key, filepath, fn);
    },

    _delSync: function (key, filepath) {
        if (!fs.existsSync(filepath)) return;
        fs.unlinkSync(filepath);

    },

    _delAsync: function (key, filepath, fn) {
        fs.exists(function (exists) {
            if (!exists) return fn();
            fs.unlink(filepath, fn);
        });
    }
};

var _addMethod = function (method, isSync) {

    var realMethod = "_" + (isSync ? method.replace(/Sync$/, "") : method);
    Cache.prototype[method] = function () {
        var args = __slice.call(arguments),
            fn = !isSync ? args.pop() : null;

        args = args.concat([isSync, fn]);

        this[realMethod].apply(this, args);
    };
};

_addMethod("put", false);
_addMethod("putSync", true);
_addMethod("get", false);
_addMethod("getSync", true);
_addMethod("del", false);
_addMethod("delSync", true);


/*
    put: function (key, val, fn) {
        var args = __slice.call(arguments);
        var fn = args.pop();
        this._put.apply(this, args.concat([false, fn]));
        this.prototype.
    },

    putSync: function (key, val) {
        var args = __slice.call(arguments);
        this._put.apply(this, args.concat([true]));
    }

    get: function (key, fn) {
    },

    getSync: function (key) {
        var args = __slice.call(arguments);
        var fn = args.pop();
        // Add in isSync boolean for _put method
        this._get.apply(this, args.concat([true]));
    },

};
*/

Cache.cleanSync = function () {
    // Cleans all cache files
    if (fs.existsSync(dir)) {
        var files = fs.readdirSync(dir);
        files.forEach(function (file) {
            fs.unlinkSync(path.join(dir, file));
        });
    }
};

module.exports = Cache;
