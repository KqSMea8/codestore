const pify = require('pify')
const fs = require('fs')
const mkdirp = require('mkdirp')

const _readFile = pify(fs.readFile);
const _writeFile = pify(fs.writeFile);
const _access = pify(fs.access);

exports.makeDir = pify(mkdirp);
exports.readdir = pify(fs.readdir);
exports.stat = pify(fs.stat);
exports.chmod = pify(fs.chmod);
exports.readFile = path => _readFile(path, 'utf8');
exports.writeFile = (path, data) => _writeFile(path, data, 'utf8');
exports.readFileRaw = path => _readFile(path, null);
exports.writeFileRaw = (path, data) => _writeFile(path, data, null);
exports.fileExists = path => _access(path).then(() => true, () => false);

exports.constants = fs.constants;