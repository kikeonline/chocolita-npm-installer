#!/usr/bin/env node

require('shelljs/global');
var chalk = require('chalk');
var inquirer = require('inquirer');
var program = require('commander');
var replace = require("replace");
var path = require('path');
var fs = require('fs')
var os = require('os');
var currentDir = process.cwd();
var currentFolder = currentDir.split(path.resolve('/')).pop()
var EOL = os.EOL;
const log = console.log;
const updateNotifier = require('update-notifier');
const pkg = require('./package.json');

function banner() {
	log(chalk.bold.blue(EOL +
		'               _____ _                     _ _ _        ' + EOL +
		'    ()_()     /  __ \\ |                   | (_) |       ' + EOL + 
		'   (     )    | /  \\/ |__   ___   ___ ___ | |_| |_ __ _ ' + EOL +
		'(--| O O |--) | |   |  _ \\ / _ \\ / __/ _ \\| | | __/ _\\ | ' + EOL +
		' --|_____|--  | \\__/\\ | | | (_) | (_| (_) | | | || (_| |' + EOL +
		'  (  . .  )    \\____/_| |_|\\___/ \\___\\___/|_|_|\\__\\__,_|' + EOL +
		'   –------     Wordpress Tema Base - NPM Installer 1.0.7' + EOL + 
		'      ()'));
	console.log('');
}
function bye() {
	console.error(chalk.red(EOL +
		'    ()_()' + EOL + 
		'   (     )' + EOL + 
		' --| X x |--' + EOL +
		'(--|_____|--)' + EOL +
		'  (  . .  )' + EOL +
		'   –------' + EOL + 
		'      ()'));
	updateNotifier({pkg}).notify();
}
function exito() {
	console.error(chalk.bold.green(EOL +
		'    ()_()' + EOL + 
		'   (     )                 Instalación Completada ✓ 🐮' + EOL + 
		' --| O O |--         Ingresa a WordPress y activa el tema.' + EOL +
		'(--|_____|--)                Para más información:' + EOL +
		'  (  . .  )         https://github.com/monchitonet/Chocolita' + EOL +
		'   –------    https://github.com/kikeonline/chocolita-npm-installer' + EOL + 
		'      ()'));
	updateNotifier({pkg}).notify();
	process.exit();
}

function wordpressThemeCheck() {
	if (currentFolder === 'themes') {
		log(chalk.bold.green('✓ Wordpress theme encontrado.'));
	} else {
		console.error(chalk.bold.red('! Wordpress theme folder? ✘' + EOL));
	}
}

function gitCheck() {
	if (!which('git')) {
		console.error(chalk.bold.red('! Git NO está instalado ✘'));
	} else {
		log(chalk.bold.green('✓ Git'));
	}
	if (!which('gulp')) {
		console.error(chalk.bold.red('! Gulp NO está instalado ✘'));
	} else {
		log(chalk.bold.green('✓ Gulp'));
	}
	if (!which('bower')) {
		console.error(chalk.bold.red('! Bower NO está instalado ✘'));
	} else {
		log(chalk.bold.green('✓ Bower'));
	}
}

var questions = [
{
	type: 'input',
	name: 'themename',
	message: 'Nombre del tema?',
	default: function () {
		return 'chocolita';
	}
},
{
	type: 'input',
	name: 'host',
	message: 'Dirección localhost?',
	default: function () {
		return 'localhost';
	}
}
];

var localHostQuestion = [
{
	type: 'input',
	name: 'host',
	message: 'Dirección localhost?',
	default: function () {
		return 'localhost';
	}
}
];

var yN = [
{
	type: 'confirm',
	name: 'install',
	message: 'Confirma la información, Continuar? '
}
];

var npmInstallQuestion = [
{
	type: 'confirm',
	name: 'install',
	message: 'Queres correr npm install y bower install? (Requiere paciencia)',
	default: false
}
];

function npmInstall(themeName) {
	inquirer.prompt(npmInstallQuestion).then(function (answer) {
		if (answer.install === true) {
			log(chalk.yellow('> npm install...'));
			if (exec('npm install --prefix ' + themeName + ' ').code !== 0) {
				console.error(chalk.bold.red('! npm install falló ✘'));
				bye();
				exit(1);
			} else {
				log(chalk.bold.green('✓ npm install Completado 🐮 ' + EOL));
			}
			log(chalk.yellow('> bower install...'));
			cd(themeName);
			if (exec('bower install').code !== 0) {
				console.error(chalk.bold.red('! bower install falló ✘'));
				bye();
				exit(1);
			} else {
				log(chalk.bold.green('✓ bower install Completado 🐮 ' + EOL));
			}
			exito();
		} else {
			exito();
		}
	});
}

function replaceText(filePath, text, replaceText) {
	fs.readFile(filePath, 'utf8', function(err, data) {
		if (err) {
			return console.error(err);
			bye();
		}
		var result = data.replace(text, replaceText);
		fs.writeFile(filePath, result, 'utf8', function(err) {
			if (err) {
				return console.error(err);
				bye();
			};
		});
	});
	log(chalk.green('✓ ' + text + ' => ' + replaceText));
}

function replaceTextDir(path, text, replaceText) {
	replace({
		regex: text,
		replacement: replaceText,
		paths: [path],
		recursive: true,
		silent: false,
	});
	log(chalk.green('✓ ' + text + ' => ' + replaceText));
}

function gitClone(themeName, hostName) {
	if (exec('git clone https://github.com/monchitonet/Chocolita.git ' + themeName).code !== 0) {
		console.error(chalk.bold.red('! No se pudo bajar chocolita ✘' + EOL));
		bye();
		process.exit();
	}
	log(chalk.bold.green('✓ Chocolita instalado 🐮 ' + EOL));
	if (themeName === 'chocolita') {
		log(chalk.yellow('> Reemplazando variables a ' + themeName + "..."));
		var gulpFile = path.join(themeName, 'gulpfile.js');
		replaceText(gulpFile, "proxy: 'playground'", "proxy: '"+ hostName +"'");
		log(chalk.bold.green('✓ Completado 🐮 ' + EOL));
		npmInstall(themeName);
	} else {
		log(chalk.yellow('> Reemplazando variables a ' + themeName + "..."));
		var styleCssFile = path.join(themeName, 'style.css');
		var gulpFile = path.join(themeName, 'gulpfile.js');
		replaceText(styleCssFile, 'Theme Name: Chocolita', 'Theme Name: ' + themeName);
		log(chalk.green('✓ Cambiando gulpfile...'));
		replaceText(gulpFile, "proxy: 'playground',", "proxy: '" + hostName + "',");
		replaceTextDir(themeName + path.resolve("/."), "'dist/chocolita'", "'dist/" + themeName + "'"); //build-copy
		replaceTextDir(themeName + path.resolve("/."), "'chocolita.zip'", "'" + themeName + ".zip'"); //build-zip
		replaceTextDir(themeName + path.resolve("/."), "'!dist/chocolita.zip'", "'!dist/" + themeName + ".zip'"); //build-delete
		log(chalk.green('✓ Cambiando archivos varios...'));
		replaceTextDir(themeName + path.resolve("/."), "'chocolita'", "'" + themeName + "'"); //text domain
		replaceTextDir(themeName + path.resolve("/."), "chocolita_", themeName + "_"); //function name
		replaceTextDir(themeName + path.resolve("/."), " chocolita", " " + themeName); //DocBlocks
		replaceTextDir(themeName + path.resolve("/."), "chocolita-", themeName + "-"); //prefixed handles
		log(chalk.bold.green('✓ Completado 🐮 ' + EOL));
		npmInstall(themeName);
	}
}

function install(themeName, hostName) {
	inquirer.prompt(yN).then(function (answer) {
		if (answer.install === true) {
			log(chalk.yellow( EOL + '> Bajando la última versión de Chocolita...'));
			gitClone(themeName, hostName);
		} else {
			log(chalk.red( EOL + '! Instalación cancelada.'));
			bye();
			process.exit();
		}
	});
}

program
.version('1.0.7')
.option('-v, --version', 'output version number')
.arguments('<themename> [localhost]')
.action(function (themename, localhost) {
	banner();
	gitCheck();
	wordpressThemeCheck();
	themeName = themename;
	hostName = localhost;
	log(chalk.green('> ') + chalk.bold('Nombre del tema: ') + chalk.cyan('%s'), themeName);
	if (hostName === undefined) {
		inquirer.prompt(localHostQuestion).then(function (answer) {
			var hostName = answer.host
			log(chalk.green('> ') + chalk.bold('Directorio de Instalación: ') + chalk.cyan(currentDir + '/%s'), themeName);
			install(themeName, hostName);
		});
	} else {
		log(chalk.green('> ') + chalk.bold('Dirección localhost: ') + chalk.cyan('%s'), hostName);
		log(chalk.green('> ') + chalk.bold('Directorio de Instalación: ') + chalk.cyan(currentDir + '/%s'), themeName);
		install(themeName, hostName);
	}
});
program.parse(process.argv);

if (typeof themeName === 'undefined') {
	banner();
	gitCheck();
	wordpressThemeCheck();
	inquirer.prompt(questions).then(function (answer) {
		var themeName = answer.themename
		var hostName = answer.host
		log(chalk.green('> ') + chalk.bold('Directorio de Instalación: ') + chalk.cyan(currentDir + '/%s'), themeName);
		install(themeName, hostName);
	});
}