`version 0.0.1`

# FSCache
`FSCache` is a filesystem based caching utility. It stores values based on `key/value`. `Key` and `Value` must both be JSON serializable.

## Where should I use this
Since `FSCache` writes to disk (obviously), you should not use this tool as a frequently accessed data store for high traffic websites/web apis. `FSCache` is better used for **command line tools**, infrequently accessed configurations, or any project where you need a lightweight `key/val` store and performance for high traffic is not a concern.

Though the api contains both `sync` and `async` versions for accessing the cache, reading/writing to disk is an expensive process.

## Install

`npm install fscache`


## API
As typical in node, there is a `async` and `sync` version of each method.

### Creating a new cache
This method creates a new directory that you specify which will act as your cache storage.
It returns a `Cache` object for accessing the cache.

```
/*
 * @param {Number} ttl - how long to store a value. null will store forever
 *		default: null
 * @param {String} dir - Where to store data
 */

var Cache = require("fscache");

// Async
Cache.create(50, dir, function (err, cache) {
	// Do stuff with cache	
});

// Sync
var cache = Cache.createSync(1000, dir);
```

### Put
Store data

```
/*
 * @visibility private
 * @param {Mixed} key - A JSON stringifiable value 
 * @param {Mixed} val - a JSON stringifiable value
 */
 
 // Async
 cache.put({id: 1}, "cached", function(err), function () {
 });
 
 cache.putSync({id: 2}, {cached: "data"});
```

### Get
Get a stored value

```
/*
 * @param {Mixed} key - A JSON stringifiable key that is used to lookup
 *                      up a cached file
 */
 
 // Async
 cache.get({id: 1}, function (err, val) {
     if (err) throw err;
     console.log(val); // "cached";
 });
 
 // Sync
 var val = cache.get({id: 2});
 console.log(val); // {cached: "data"}
 
```

### Del

```
/*
 * @param {Mixed} key - A JSON stringifiable key that is used to lookup
 *                      up a cached file
 */
 
 // Async
 cache.del({id:1}, function (err) {
     if (err) throw err;
 });
 
 // Sync
 cache.del({id: 2});
```