// ================================================================
// --- node modules.
// -------------------------------------------------------------

// --- gulp

var g = require('gulp');

// --- gulp-plugins

var	concat  = require('gulp-concat'),
	filter  = require('gulp-filter'),
	plumber = require('gulp-plumber'),
	tsc     = require('gulp-tsc'),
    uglify  = require('gulp-uglify'),
    rename  = require('gulp-rename'),
	SubTask = require('gulp-subtask')(g);

// ================================================================
// --- gulp-subtask.
// -------------------------------------------------------------

// --- SubTask

var tscTask = new SubTask('tsc')
    .src(['{{srcDir}}/{{src}}','!**/*.d.ts','!*.d.ts'])
    .pipe( plumber )
    .pipe( tsc, {
    	declaration    : true,
        tmpDir         : '{{tmpDir}}',
    	out            : '{{out}}',
        outDir         : '{{srcDir}}/',
        removeComments : true
    })
    .pipe( g.dest, '{{srcDir}}' );

// ================================================================
// --- gulp tasks.
// -------------------------------------------------------------

g.task('default',function(){
    tscTask
        .run({
            tmpDir : "src",
            srcDir : "src",
            src    : "Cycle.ts",
            out    : "Cycle.js"
        })
        .pipe( filter(['*.js']) )
        .pipe( g.dest('bin') )
        .pipe( uglify() )
        .pipe( rename(function(path){
            path.basename += ".min";
        }))
        .pipe( g.dest('bin') );
});