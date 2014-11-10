module.exports = function (grunt) {
    grunt.config.merge({
        browserify: {
            build: {
                files: {
                    'dist/runningman.js': [
                        'src/*.js'
                    ]
                }
            }
        }
    });
};
