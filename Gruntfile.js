"use strict";
module.exports = function(grunt) {

  // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        jshint: {
            options: {
                eqeqeq: true,
                eqnull: true,
                indent: 4,
                newcap: true,
                undef: true,
                unused: true,
                strict: false,
                trailing: true,
                devel: true,
                node: true,
                globals: {
                    path: true,
                    logger: true,
                    assert: true,
                    twitter: true
                }
            },
            all: ["Gruntfile.js", "lib/**/*.js", "test/**/*.js"]
        },

        mochaTest: {
            files: ["tests/**/*.js"]
        },
        mochaTestConfig: {
            options: {
                reporter: "list",
                slow: 500,
                timeout: 1000,
                globals: []
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-mocha-test");

    // Default task(s).
    grunt.registerTask("default", ["jshint", "mochaTest"]);
    grunt.registerTask("test", "mochaTest");

};
