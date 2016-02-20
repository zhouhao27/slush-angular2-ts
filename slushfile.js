/*
 * slush-angular2-ts
 * https://github.com/zhouhao/slush-angular2-ts
 *
 * Copyright (c) 2016, zhouhao
 * Licensed under the MIT license.
 */

'use strict';

var gulp = require('gulp'),
    install = require('gulp-install'),
    conflict = require('gulp-conflict'),
    template = require('gulp-template'),
    rename = require('gulp-rename'),
    _ = require('underscore.string'),
    inquirer = require('inquirer'),
    path = require('path');

function format(string) {
    var username = string.toLowerCase();
    return username.replace(/\s/g, '');
}

var defaults = (function () {
    var workingDirName = path.basename(process.cwd()),
      homeDir, osUserName, configFile, user;

    if (process.platform === 'win32') {
        homeDir = process.env.USERPROFILE;
        osUserName = process.env.USERNAME || path.basename(homeDir).toLowerCase();
    }
    else {
        homeDir = process.env.HOME || process.env.HOMEPATH;
        osUserName = homeDir && homeDir.split('/').pop() || 'root';
    }

    configFile = path.join(homeDir, '.gitconfig');
    user = {};

    if (require('fs').existsSync(configFile)) {
        user = require('iniparser').parseSync(configFile).user;
    }

    return {
        appName: workingDirName,
        userName: osUserName || format(user.name || ''),
        authorName: user.name || '',
        authorEmail: user.email || ''
    };
})();

gulp.task('default', function (done) {
    var prompts = [{
        name: 'appName',
        message: 'What is the name of your project?',
        default: defaults.appName
    }, {
        name: 'appDescription',
        message: 'What is the description?'
    }, {
        name: 'appVersion',
        message: 'What is the version of your project?',
        default: '0.1.0'
    }, {
        name: 'authorName',
        message: 'What is the author name?',
        default: defaults.authorName
    }, {
        name: 'authorEmail',
        message: 'What is the author email?',
        default: defaults.authorEmail
    }, {
        name: 'userName',
        message: 'What is the github username?',
        default: defaults.userName
    }, {
        type: 'confirm',
        name: 'moveon',
        message: 'Continue?'
    }];
    //Ask
    inquirer.prompt(prompts,
        function (answers) {
            if (!answers.moveon) {
                return done();
            }
            answers.appNameSlug = _.slugify(answers.appName);
            gulp.src(__dirname + '/templates/**')
                .pipe(template(answers))
                .pipe(rename(function (file) {
                    if (file.basename[0] === '_') {
                        file.basename = '.' + file.basename.slice(1);
                    }
                }))
                .pipe(conflict('./'))
                .pipe(gulp.dest('./'))
                .pipe(install())
                .on('end', function () {
                    done();
                });
        });
});

gulp.task('component', function (cb) {
  Util.checkDir(cb);
  inquirer.prompt([
    Util.promptFn.nameIt('component', gulp.args),
    Util.promptFn.selectIt(2),
    Util.promptFn.intOrExt('styles'),
    Util.promptFn.intOrExt('template'),
    Util.promptFn.importIt('common'),
    Util.promptFn.importIt('core'),
    Util.promptFn.importIt('http'),
    Util.promptFn.importIt('router'),
    Util.promptFn.confirmIt('component')
    ], function (answers) {
      if (!answers.good) {
        return cb();
      }
      answers.camel = Util.camelize(answers.component);
      answers.mod = Util.classable(answers.camel);
      answers.slug = Util.slugify(answers.component);
      answers.select = Util.selectable(answers.selector, answers.slug);
      var source = [path.join(__dirname, 'templates/options/component/component.ts')];
      if (answers.styles == 'external') {
        source.push(path.join(__dirname, 'templates/options/styles.css'));
      }
      if (answers.template == 'external') {
        source.push(path.join(__dirname, 'templates/options/template.html'));
      }
      gulp.src(source)
        .pipe(template(answers))
        .pipe(rename(function (file) { file.basename = answers.camel; }))
        .pipe(conflict(path.join(process.cwd(), 'src/component')))
        .pipe(gulp.dest(path.join(process.cwd(), 'src/component')))
          .on('finish', function () { cb(); }).resume();
      });
});
gulp.task('directive', function (cb) {
    Util.checkDir(cb);
    inquirer.prompt([
        Util.promptFn.nameIt('directive', gulp.args),
        Util.promptFn.selectIt(0),
        Util.promptFn.importIt('core'),
        Util.promptFn.confirmIt('directive')
    ], function (answers) {
        if (!answers.good) {
            return cb();
        }
        answers.camel = Util.camelize(answers.directive);
        answers.mod = Util.classable(answers.camel);
        answers.slug = Util.slugify(answers.directive);
        answers.select = Util.selectable(answers.selector, answers.slug);
        gulp.src(path.join(__dirname, 'templates/options/directive/directive.ts'))
            .pipe(template(answers))
            .pipe(rename(function (file) { file.basename = answers.camel; }))
            .pipe(conflict(path.join(process.cwd(), 'src/directive')))
            .pipe(gulp.dest(path.join(process.cwd(), 'src/directive')))
            .on('finish', function () { cb(); }).resume();
    });
});
gulp.task('pipe', function (cb) {
    Util.checkDir(cb);
    inquirer.prompt([
        Util.promptFn.nameIt('pipe', gulp.args),
        Util.promptFn.confirmIt('pipe')
    ], function (answers) {
        if (!answers.good) {
            return cb();
        }
        answers.camel = Util.camelize(answers.pipe);
        answers.mod = Util.classable(answers.camel);
        answers.slug = Util.slugify(answers.pipe);
        gulp.src(path.join(__dirname, 'templates/options/pipe/pipe.ts'))
            .pipe(template(answers))
            .pipe(rename(function (file) { file.basename = answers.camel; }))
            .pipe(conflict(path.join(process.cwd(), 'src/shared')))
            .pipe(gulp.dest(path.join(process.cwd(), 'src/shared')))
            .on('finish', function () { cb(); }).resume();
    });
});
gulp.task('service', function (cb) {
    Util.checkDir(cb);
    inquirer.prompt([
        Util.promptFn.nameIt('service', gulp.args),
        Util.promptFn.confirmIt('service')
    ], function (answers) {
        if (!answers.good) {
            return cb();
        }
        answers.camel = Util.camelize(answers.service);
        answers.mod = Util.classable(answers.camel);
        gulp.src(path.join(__dirname, 'templates/options/service/service.ts'))
            .pipe(template(answers))
            .pipe(rename(function (file) { file.basename = answers.camel; }))
            .pipe(conflict(path.join(process.cwd(), 'src/shared')))
            .pipe(gulp.dest(path.join(process.cwd(), 'src/shared')))
            .on('finish', function () { cb(); }).resume();
    });
});
var ng2API = {
    animation: [],
    common: ['COMMON_DIRECTIVES', 'CORE_DIRECTIVES', 'FORM_DIRECTIVES', 'FORM_PROVIDERS', 'FormBuilder', 'Validators'],
    compiler: [],
    core: ['DEFAULT_PIPES', 'Attribute', 'EventEmitter', 'Host', 'HostBinding', 'HostListener', 'Inject', 'Input', 'Optional', 'Output', 'Query'],
    http: ['HTTP_PROVIDERS', 'JSON_PROVIDERS', 'Http', 'Jsonp'],
    router: ['ROUTER_DIRECTIVES', 'ROUTER_PROVIDERS', 'RouteConfig', 'CanActivate', 'Location'],
    testing: []
};

var Util = {
    camelize: function (str) {
        return str.charAt(0).toLowerCase() + str.slice(1).replace(/[-_\s]+(.)?/g, function (m, c) { return c ? c.toUpperCase() : ''; });
    },
    classable: function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    selectable: function (ans, str) {
        if (ans == 'element') {
            return str;
        }
        else if (ans == 'attribute') {
            return '['.concat(str, ']');
        }
        else if (ans == 'class') {
            return '.' + str;
        }
    },
    slugify: function (str) {
        return str.toLowerCase().replace(/\s/g, '-');
    },
    checkDir: function (cb) {
        try {
            require(path.join(process.cwd(), 'package.json'));
        }
        catch (e) {
            console.log('Run task in root dir of project.');
            return cb();
        }
    },
    promptFn: {
        nameIt: function (str, def) {
            return {
                type: 'input',
                message: 'Name your ' + str + ':',
                name: str,
                validate: function (input) { return /\w/g.test(input) || 'Seriously, name it:'; },
                filter: function (input) { return input.toString().trim(); },
                default: def
            };
        },
        confirmIt: function (str) {
            return {
                type: 'confirm',
                message: function (input) { return 'Create ' + str + ' ' + input[str] + '?'; },
                name: 'good',
                default: true
            };
        },
        importIt: function (str) {
            return {
                type: 'checkbox',
                message: 'Imports from ' + str + ':',
                name: str,
                choices: ng2API[str],
                paginated: true
            };
        },
        intOrExt: function (str) {
            return {
                type: 'list',
                message: 'Inline or external ' + str + '?',
                name: str,
                choices: ['inline', 'external'],
                default: 0
            };
        },
        selectIt: function (index) {
            return {
                type: 'list',
                message: 'Selector type:',
                name: 'selector',
                choices: ['attribute', 'class', 'element'],
                default: index
            };
        }
    }
};
