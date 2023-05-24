const { spawn, spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

function convertPyTypes(_value, _key = "") {
  if (_value === undefined)
    return convertPyTypes(DEFAULT_VALUES[_key])
  if (_value === true)
    return "True"
  if (_value === false)
    return "False"
  if (_value === "center")
    return "None"
  if (typeof _value == "string")
    return `\"${_value}\"`
  return _value
}

function killProcess(_pid, sync = false) {
  if (sync)
    spawnSync("taskkill", ["/pid", _pid, '/f', '/t']);
  spawn("taskkill", ["/pid", _pid, '/f', '/t']);
}

function extractNames(code, parent) {
  const functionRegex = /function\s+([^(\s]+)\s*\(/g;
  const variableRegex = /(?:var|let|const)\s+([^=\s;]+)/g;
  let names = "";
  let match;

  // Extract function names
  while ((match = functionRegex.exec(code)) !== null) {
    const opening = (code.substring(0, match.index).match(/\{/g) || []).length
    const closing = (code.substring(0, match.index).match(/\}/g) || []).length
    if (opening == closing) {
      names += `${parent}.${match[1]} = ${match[1]}\n`;
    }
  }

  // Extract variable names
  while ((match = variableRegex.exec(code)) !== null) {
    const opening = (code.substring(0, match.index).match(/\{/g) || []).length
    const closing = (code.substring(0, match.index).match(/\}/g) || []).length
    if (opening == closing && match[1] !== "{") {
      names += `${parent}.${match[1]} = ${match[1]}\n`;
    }
  }

  return names;
}


function copyFolderSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target);
  }
  const files = fs.readdirSync(source);
  files.forEach((file) => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);
    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyFolderSync(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
    //else if (path.extname(file) === '.scss'||path.extname(file) === 'css.map') { // filter out  files
    //}
  });
}

function generateRandomString(length) {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  while (result.length < length) {
    const randomChar = characters[Math.floor(Math.random() * characters.length)];
    if (result.length === 0 && /[0-9]/.test(randomChar)) {
      continue; // Skip if the first character is a number
    }
    result += randomChar;
  }

  return result;
}



module.exports = { convertPyTypes, killProcess, extractNames, copyFolderSync, generateRandomString }
