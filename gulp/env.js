'use strict';

var path = require('path'),
  gulp = require('gulp'),
  conf = require('./conf'),
  gulpNgConfig = require('gulp-ng-config');

gulp.task('env:development', function () {
  gulp.src(path.join(conf.paths.src, '/app/environments.json'))
    .pipe(gulpNgConfig('environments.config', {
      environment: 'development'
    }))
    .pipe(gulp.dest(path.join(conf.paths.src, '/app/')))
});

gulp.task('env:production', function () {
  gulp.src(path.join(conf.paths.src, '/app/environments.json'))
    .pipe(gulpNgConfig('environments.config', {
      environment: 'production'
    }))
    .pipe(gulp.dest(path.join(conf.paths.src, '/app/')))
});

gulp.task('env:uat', function () {
  gulp.src(path.join(conf.paths.src, '/app/environments.json'))
    .pipe(gulpNgConfig('environments.config', {
      environment: 'uat'
    }))
    .pipe(gulp.dest(path.join(conf.paths.src, '/app/')))
});
