var gulp = require('gulp');

// Run this to compress all the things!
gulp.task('production', ['karma'], function(){
  // This runs only if the karma tests pass
  gulp.start(['markup', 'images', 'iconFont', 'minifyCss', 'uglifyJs'])
});

gulp.task('production_test', ['karma'], function(){
  // This runs only if the karma tests pass
  gulp.start(['markup', 'images', 'iconFont', 'minifyCss', 'uglifyJs_test'])
});
