module.exports = function (grunt) {
  var port = grunt.option('port') || 8000;
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: 'jQuery.dotdotdot to AngularJS port'
    },
    coffee: {
      compile: {
        files: {
          'js/angular.dotdotdot.js': 'src/angular.dotdotdot.coffee'
        }
      }
    },
    coffeelint: {
      app: ['src/angular.dotdotdot.coffee'],
      options: {
        max_line_length: {
          level: 'ignore'
        }
      }
    },
    less: {
      development: {
        options: {
          paths: ["assets/css"]
        },
        files: {
          "css/styles.css": "css/styles.less"
        }
      }
    },
    cssmin: {
      development: {
        files: {
          'css/styles.min.css': ['css/styles.css']
        }
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd h:M:stt") %> */\n'
      },
      build: {
        src: 'js/angular.dotdotdot.js',
        dest: 'js/angular.dotdotdot.min.js'
      }
    },
    connect: {
      server: {
        options: {
          index: ['index.html'],
          port: port,
          base: '.',
          livereload: true,
          open: true
        }
      }
    },
    watch: {
      options: {
        livereload: true
      },
      coffee: {
        files: ['src/**/*.coffee'],
        tasks: 'coffeegen'
      },
      cssmin: {
        files: ['css/styles.less'],
        tasks: 'cssgen'
      },
      js: {
        files: ['Gruntfile.js', 'js/angular.dotdotdot.js'],
        tasks: 'uglify'
      },
      html: {
        files: ['index.html', 'angular.html']
      }
    }

  });
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-coffeelint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Code generators
  grunt.registerTask('coffeegen', ['coffeelint', 'coffee', 'uglify']);
  grunt.registerTask('cssgen', ['less', 'cssmin']);

  // Final Generators
  grunt.registerTask('build', ['coffeegen', 'cssgen']);
  grunt.registerTask('serve', ['build', 'connect', 'watch']);
};