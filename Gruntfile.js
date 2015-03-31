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
  grunt.loadNpmTasks('grunt-coffeelint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('coffeegen', ['coffeelint', 'coffee']);
  grunt.registerTask('build', ['coffeegen', 'uglify']);
  grunt.registerTask('serve', ['connect', 'watch']);
};