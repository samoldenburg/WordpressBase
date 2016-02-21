var gulp = require('gulp'),
    browsersync = require('browser-sync').create(),
    buffer = require('vinyl-buffer'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    gutil = require('gulp-util'),
    imagemin = require('gulp-imagemin'),
    merge = require('merge-stream'),
    notify = require('gulp-notify'),
    plumber = require('gulp-plumber'),
    prompt = require('gulp-prompt'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    spritesmith = require('gulp.spritesmith'),
    uglify = require('gulp-uglify');

// include the config file
try {
    var config = require('./gulp.config.json');
}
catch (err) {
    // to be completed.... at the moment this is pretty sloppy, for now lets just yell at you for not having the config file.
    gutil.log(err);

    /*
    gutil.log('Configuration file not found. Entering setup mode!');

    gulp.task('default', ['setup'], function() {

    });

    var browsersync_proxy = '';
    var theme_name = '';

    gulp.task('setup', function() {
        gulp.src('gulp.config.json.sample')
        .pipe(prompt.prompt({
            type: 'input',
            name: 'browsersync_proxy',
            message: 'Browsersync Proxy? (Skip to not use browsersync, else enter your local environment URL for this project)'
        }, function(res){
            browsersync_proxy = res.browsersync_proxy;
        }))
        .pipe(prompt.prompt({
            type: 'input',
            name: 'theme_name',
            message: 'Theme name? (Will name the theme folder)'
        }, function(res){
            theme_name = res.theme_name;
        }));
    });*/
}

if (config) {
    var paths = {
        sprites: './src/sprites/**/*.png',
        sprites2x: './src/sprites/**/*@2x.png',
        scripts: './src/js/**/*.js',
        styles: './src/scss/**/*.scss',
        main_style: './src/scss/main.scss',
        themes: './src/themes/**/*',
        plugins: './src/plugins/**/*'
    };

    var dest_paths = {
        plugins: './web/wp-content/plugins/',
        themes: './web/wp-content/themes/',
        theme: './web/wp-content/themes/' + config.theme_name,
        css: './src/themes/' + config.theme_name + '/css',
        img: './src/themes/' + config.theme_name + '/img',
        js: './src/themes/' + config.theme_name + '/js',
        build_scss: './src/scss'
    }

    gulp.task('default', ['watch'], function() {

    });

    gulp.task('clean', function() {
        return gulp.src(dest_paths.theme, {read: false})
            .pipe(clean());
    });

    gulp.task('copy:themes', ['styles', 'scripts'], function() {
        gulp.src(paths.themes).pipe(gulp.dest(dest_paths.themes));
    });

    gulp.task('only_copy:themes', function() {
        gulp.src(paths.themes).pipe(gulp.dest(dest_paths.themes));
    });

    gulp.task('copy:plugins', ['styles', 'scripts'], function() {
        gulp.src(paths.plugins).pipe(gulp.dest(dest_paths.plugins));
    })

    gulp.task('only_copy:plugins', function() {
        gulp.src(paths.plugins).pipe(gulp.dest(dest_paths.plugins));
    })

    gulp.task('styles', ['clean', 'sprites'], function () {
        return gulp.src(paths.main_style)
            .pipe(sass())
            .on('error', notify.onError(function (error) {
                return 'Sass Error: ' + error;
            }))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(dest_paths.css))
            .pipe(browsersync.stream());
    });

    gulp.task('scripts', ['clean'], function() {
        return gulp.src(paths.scripts)
            .pipe(concat('concat.js'))
            .pipe(gulp.dest(dest_paths.js))
            .pipe(rename('uglify.js'))
            .pipe(uglify())
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(dest_paths.js));
    });

    gulp.task('sprites', function() {
        var spriteData = gulp.src(paths.sprites).pipe(spritesmith({
            imgName: 'sprite.png',
            cssName: '_sprite.scss',
            retinaSrcFilter: [paths.sprites2x],
            retinaImgName: 'sprite@2x.png'
        }));

        // Pipe image stream through image optimizer and onto disk
        var imgStream = spriteData.img
            // DEV: We must buffer our stream into a Buffer for `imagemin`
            .pipe(buffer())
            .pipe(imagemin())
            .pipe(gulp.dest(dest_paths.img));

        // Pipe CSS stream through CSS optimizer and onto disk
        var cssStream = spriteData.css
            .pipe(gulp.dest(dest_paths.css));

        // Return a merged stream to handle both `end` events
        return merge(imgStream, cssStream);
    });

    gulp.task('build', ['copy:themes', 'copy:plugins'], function() {

    });

    // Watch - run build first, then just update what is needed.
    gulp.task('watch', ['build'], function () {
        if (config.browsersync_proxy) {
            browsersync.init({
                proxy: config.browsersync_proxy
            });
        }

        gulp.watch(paths.styles, ['styles']);
        gulp.watch(paths.scripts, ['scripts']);
        gulp.watch(paths.sprites, ['sprites']);
        gulp.watch(paths.themes, ['only_copy:themes']);
        gulp.watch(paths.plugins, ['only_copy:plugins']);
        if (config.browsersync_proxy && config.browsersync_reload) {
            // Also reload browsersync on theme/plugin changes.
            gulp.watch(paths.themes).on('change', browsersync.reload);
            gulp.watch(paths.plugins).on('change', browsersync.reload);
        }
    });
}
