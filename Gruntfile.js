module.exports = function(grunt) {

    grunt.initConfig({

        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [
                    'src/ui-components.js',
                    'src/ui-element.js',
                    'src/ui-modal.js',
                    'src/ui-popover.js',
                    'src/ui-toggle-checkbox.js',
                    'src/ui-tools.js'
                ],
                dest: 'build/angular-ui-components.js'
            }
        },

        uglify: {
            build: {
                files: {
                    'build/angular-ui-components.min.js': ['build/angular-ui-components.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build', [
        'concat',
        'uglify'
    ]);

};