var gulp = require('gulp'),
    argv = require('yargs').argv,
    browsersync = require('browser-sync').create(),
    buffer = require('vinyl-buffer'),
    clean = require('gulp-clean'),
    colors = require('colors'),
    concat = require('gulp-concat'),
    gutil = require('gulp-util'),
    imagemin = require('gulp-imagemin'),
    jeditor = require("gulp-json-editor"),
    merge = require('merge-stream'),
    notify = require('gulp-notify'),
    prompt = require('gulp-prompt'),
    rename = require('gulp-rename'),
    replace = require('gulp-replace'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    spritesmith = require('gulp.spritesmith'),
    uglify = require('gulp-uglify');

gulp.task('help', function() {
    console.log('');
    console.log('Simply run ' + 'gulp'.green + ' to do most things. If you need to run individual tasks, reference the list below.');
    console.log('');
    console.log('Pass the -' + 'p'.cyan + ', --' + 'prod'.cyan + ', or --' + 'production'.cyan + ' args to build for production.');
    console.log('');
    console.log('gulp' + ' ' + 'setup'.green + '                ' + '# Run the initial config. Only available if not already ran.'.grey);
    console.log('gulp' + ' ' + 'build'.green + '                ' + '# Build everything.'.grey);
    console.log('gulp' + ' ' + 'clean'.green + '                ' + '# Clean up built files.'.grey);
    console.log('gulp' + ' ' + 'copy:themes'.green + '          ' + '# Copy theme files, building styles and scripts along the way.'.grey);
    console.log('gulp' + ' ' + 'only_copy:themes'.green + '     ' + '# Copy theme files without building anything.'.grey);
    console.log('gulp' + ' ' + 'copy:plugins'.green + '         ' + '# Copy plugin files, building styles and scripts along the way.'.grey);
    console.log('gulp' + ' ' + 'only_copy:plugins'.green + '    ' + '# Copy plugin files without building anything.'.grey);
    console.log('gulp' + ' ' + 'styles'.green + '               ' + '# Render styles, inject to browsersync if available.'.grey);
    console.log('gulp' + ' ' + 'scripts'.green + '              ' + '# Concat and uglify javascript.'.grey);
    console.log('gulp' + ' ' + 'sprites'.green + '              ' + '# Build sprites (including retina), run imagemin on the results.'.grey);
    console.log('gulp' + ' ' + 'watch'.green + '                ' + '# Default gulp task.'.grey);

    console.log('gulp' + ' ' + 'uninstall'.red + '            ' + '# Remove your configuration files and start over'.grey);
    console.log('');
});

// just to help with booleans
function interpretBooleanInput(string) {
    if (string == "true")
        return true;
    if (string == "false")
        return false;
    return string;
}

// for true/false only...
function interpretBooleanOnlyInput(string) {
    if (string == "true")
        return true;
    return false;
}

// try to include the config file
try {
    var config = require('./gulp.config.json');
}
catch (err) {
    // It doesn't exist, setup mode!
    gutil.log('Configuration file not found. Entering setup mode!');
    gutil.log('Note: Defaults will be used if any line is left blank');
    gutil.log('Note: true/false will be interpretted as booleans. Strings will be used otherwise.');

    gulp.task('default', ['setup'], function() {

    });

    // gulp.config.json
    var browsersync_proxy = false;
    var browsersync_reload = false;
    var theme_name = 'base';

    // local.config.php
    var db_name = '';
    var db_user = 'root';
    var db_password = '';
    var db_host = 'localhost';
    var force_ssl = false;

    // setup task, this looks a bit unruly but it does get the job done.
    gulp.task('setup', function() {
        gulp.src('gulp.config.sample.json') // Doesn't actually matter
        .pipe(prompt.confirm('Continue with setup?')) // Give them the option to back out now
        .pipe(prompt.prompt({
            type: 'input',
            name: 'val',
            message: 'Browsersync Proxy? (Default: false)'
        }, function(res){
            var interpretted = interpretBooleanInput(res.val)
            if (interpretted)
                browsersync_proxy = interpretted;
        }))
        .pipe(prompt.prompt({
            type: 'input',
            name: 'val',
            message: 'Reload browsersync instead of injecting styles? (Default: false; Boolean only!)'
        }, function(res){
            var interpretted = interpretBooleanOnlyInput(res.val)
            if (interpretted)
                browsersync_reload = interpretted;
        }))
        .pipe(prompt.prompt({
            type: 'input',
            name: 'val',
            message: 'Theme name? (Default: "base")'
        }, function(res){
            var interpretted = interpretBooleanInput(res.val)
            if (interpretted)
                theme_name = interpretted;
        }))
        .pipe(prompt.prompt({
            type: 'input',
            name: 'val',
            message: 'Database name? (Default: "")'
        }, function(res){
            var interpretted = interpretBooleanInput(res.val)
            if (interpretted)
                db_name = interpretted;
        }))
        .pipe(prompt.prompt({
            type: 'input',
            name: 'val',
            message: 'Database user? (Default: "root")'
        }, function(res){
            var interpretted = interpretBooleanInput(res.val)
            if (interpretted)
                db_user = interpretted;
        }))
        .pipe(prompt.prompt({
            type: 'input',
            name: 'val',
            message: 'Database password? (Default: "")'
        }, function(res){
            var interpretted = interpretBooleanInput(res.val)
            if (interpretted)
                db_password = interpretted;
        }))
        .pipe(prompt.prompt({
            type: 'input',
            name: 'val',
            message: 'Database host? (Database host: "localhost")'
        }, function(res){
            var interpretted = interpretBooleanInput(res.val)
            if (interpretted)
                db_host = interpretted;
        }))
        .pipe(prompt.prompt({
            type: 'input',
            name: 'val',
            message: 'Force SSL? (Default: false)'
        }, function(res){
            var interpretted = interpretBooleanInput(res.val)
            if (interpretted)
                force_ssl = interpretted;

            gutil.log("Applying configurations...");

            // nesting gulp pipes seems like a good idea...
            // first do the json config with jeditor
            gulp.src('gulp.config.sample.json')
            .pipe(jeditor({
                "browsersync_proxy":browsersync_proxy,
                "browsersync_reload":browsersync_reload,
                "theme_name":theme_name
            }))
            .pipe(rename('gulp.config.json'))
            .pipe(gulp.dest('./'));

            // Then just replace the bracketed stuff with the variables in local.config.php and move it
            gulp.src('local.config.php')
            .pipe(replace('{theme_name}', theme_name))
            .pipe(replace('{db_name}', db_name))
            .pipe(replace('{db_user}', db_user))
            .pipe(replace('{db_password}', db_password))
            .pipe(replace('{db_host}', db_host))
            .pipe(replace('{force_ssl}', force_ssl))
            .pipe(gulp.dest('./web'));

            if (theme_name != "base") {
                // Copy theme files, throw in style.css from the sample.
                gulp.src(['./src/themes/base/**/*', '!./src/themes/base/style.css'])
                .pipe(gulp.dest('./src/themes/' + theme_name));

                gulp.src('style.sample.css')
                .pipe(replace('{theme_name}', theme_name))
                .pipe(rename('style.css'))
                .pipe(gulp.dest('./src/themes/' + theme_name));
            }

            gutil.log("All set! Are you on Windows and using XAMPP? Make sure you run _win_add_host_entry.bat as well!");
        }));
    });
}

if (config) {
    // src paths
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

    gulp.task('only_copy:themes', function() { // only_copy is used for watch tasks
        gulp.src(paths.themes).pipe(gulp.dest(dest_paths.themes));
    });

    gulp.task('copy:plugins', ['styles', 'scripts'], function() {
        gulp.src(paths.plugins).pipe(gulp.dest(dest_paths.plugins));
    })

    gulp.task('only_copy:plugins', function() { // only_copy is used for watch tasks
        gulp.src(paths.plugins).pipe(gulp.dest(dest_paths.plugins));
    })

    gulp.task('styles', ['clean', 'sprites'], function () {
        var output = 'expanded';
        if (argv.p || argv.prod || argv.production) {
            output = 'compressed';
        }

        return gulp.src(paths.main_style)
            .pipe(sass({
                outputStyle: output
            }))
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
            gulp.watch(paths.scripts).on('change', browsersync.reload);
            gulp.watch(paths.sprites).on('change', browsersync.reload);
        }
    });

    gulp.task('uninstall', ['clean'], function() {
        if (config.theme_name != 'base') {
            return gulp.src(['./src/themes/' + config.theme_name + '/**/*', './gulp.config.json', './web/local.config.php'])
            .pipe(prompt.confirm('Are you sure? This cannot be undone'))
            .pipe(clean());
        }
        else {
            return gulp.src(['./gulp.config.json', './web/local.config.php'])
            .pipe(prompt.confirm('Are you sure? This cannot be undone'))
            .pipe(clean());
        }
    });
}
