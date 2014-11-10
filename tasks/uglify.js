module.exports = function (grunt) {
    grunt.config.merge({
        uglify: {
            build: {
                files: {
                    'dist/runningman.min.js': [
                        'dist/runningman.js'
                    ]
                }
            }
        }
    });
};
