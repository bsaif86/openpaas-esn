'use strict';

module.exports = function(grunt) {
  var CI = grunt.option('ci');

  var KARMA_REPORTERS = (grunt.option('reporter') || '').split(',').filter(Boolean);

  if (!KARMA_REPORTERS.length) {
    KARMA_REPORTERS = CI ? ['spec', 'coverage'] : ['dots'];
  }

  grunt.initConfig({
    concat: {
      options: {
        separator: ';'
      }
    },

    splitfiles: {
      options: {
        chunk: 10
      },
      backend: {
        options: {
          common: ['test/unit-backend/all.js'],
          target: 'mochacli:backend'
        },
        files: {
          src: ['test/unit-backend/**/*.js']
        }
      },
      modulesBackend: {
        options: {
          common: ['test/module-unit-backend-all.js'],
          target: 'mochacli:modulesBackend'
        },
        files: {
          src: ['modules/**/test/unit-backend/**/*.js']
        }
      },
      midway: {
        options: {
          common: ['test/midway-backend/all.js'],
          target: 'mochacli:midway'
        },
        files: {
          src: ['test/midway-backend/**/*.js']
        }
      },
      modulesMidway: {
        options: {
          common: ['test/midway-backend/all.js'],
          target: 'mochacli:modulesMidway'
        },
        files: {
          src: ['modules/**/test/midway-backend/**/*.js']
        }
      },
      modulesStorage: {
        options: {
          common: ['test/unit-storage/all.js'],
          target: 'mochacli:modulesStorage'
        },
        files: {
          src: ['modules/**/test/unit-storage/**/*.js']
        }
      }
    },
    mochacli: {
      options: {
        flags: process.env.INSPECT ? ['--debug-brk', '--inspect'] : ['--max-old-space-size=8192'],
        debug: false,
        require: ['chai', 'mockery'],
        reporter: 'spec',
        timeout: process.env.TEST_TIMEOUT || 20000,
        env: {
          ESN_CUSTOM_TEMPLATES_FOLDER: 'testscustom'
        },
        exit: true
      },
      backend: {
        options: {
          files: ['test/unit-backend/all.js', grunt.option('test') || 'test/unit-backend/**/*.js']
        }
      },
      modulesBackend: {
        options: {
          files: ['test/module-unit-backend-all.js', grunt.option('test') || 'modules/**/test/unit-backend/**/*.js']
        }
      },
      midway: {
        options: {
          files: ['test/midway-backend/all.js', grunt.option('test') || 'test/midway-backend/**/*.js']
        }
      },
      modulesMidway: {
        options: {
          files: ['test/midway-backend/all.js', grunt.option('test') || 'modules/**/test/midway-backend/**/*.js']
        }
      },
      storage: {
        options: {
          files: ['test/unit-storage/all.js', grunt.option('test') || 'test/unit-storage/**/*.js']
        }
      },
      modulesStorage: {
        options: {
          files: ['test/unit-storage/all.js', grunt.option('test') || 'modules/**/test/unit-storage/**/*.js']
        }
      }
    },
    karma: {
      unit: {
        configFile: './test/config/karma.conf.js',
        browsers: ['PhantomJS'],
        reporters: KARMA_REPORTERS
      },
      modulesUnit: {
        configFile: './test/config/karma.modules.conf.js',
        browsers: ['PhantomJS'],
        reporters: KARMA_REPORTERS
      },
      all: {
        configFile: './test/config/karma.conf.js',
        browsers: ['PhantomJS', 'Firefox', 'Chrome'],
        reporters: KARMA_REPORTERS
      },
      modulesAll: {
        configFile: './test/config/karma.modules.conf.js',
        browsers: ['PhantomJS', 'Firefox', 'Chrome'],
        reporters: KARMA_REPORTERS
      }
    },
    protractor: {
      options: {
        configFile: './test/config/protractor.conf.js'
      },
      all: {}
    }
  });

  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-mocha-cli');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-protractor-runner');

  grunt.loadTasks('tasks');

  grunt.registerTask('test-unit-backend', 'run the backend unit tests (to be used with .only)', ['splitfiles:backend']);
  grunt.registerTask('test-modules-unit-backend', 'run modules unit backend tests', ['splitfiles:modulesBackend']);
  grunt.registerTask('test-midway-backend', 'run midway tests (to be used with .only)', ['splitfiles:midway']);
  grunt.registerTask('test-modules-midway-backend', 'run modules midway backend tests', ['splitfiles:modulesMidway']);
  grunt.registerTask('test-unit-storage', 'run storage tests', ['mochacli:storage']);
  grunt.registerTask('test-modules-unit-storage', 'run modules unit storage tests', ['splitfiles:modulesStorage']);
  grunt.registerTask('test-backend', 'run both the unit & midway tests', ['test-unit-backend', 'test-unit-storage', 'test-midway-backend']);

  grunt.registerTask('test-frontend', 'run the FrontEnd tests', ['karma:unit']);
  grunt.registerTask('test-modules-frontend', 'run the FrontEnd tests of modules', ['karma:modulesUnit']);
  grunt.registerTask('test-frontend-all', 'run the FrontEnd tests on all possible browsers', ['karma:all']);
  grunt.registerTask('test-modules-frontend-all', 'run the FrontEnd tests of modules on all possible browsers', ['karma:modulesAll']);

  grunt.registerTask('test-e2e', 'Launch integration tests', ['protractor:all']);

  grunt.registerTask('test', ['test-backend', 'test-frontend']);
  grunt.registerTask('default', ['test']);
};
