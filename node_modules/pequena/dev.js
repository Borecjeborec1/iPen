const { spawnInEnv, checkForEnv, checkForPequena, killProcess, buildClient, buildMain } = require("./lib.js");

checkForEnv()
checkForPequena()

buildClient()

buildMain()


let pyProcess = spawnInEnv("python Pequena/main.py");

pyProcess.stdout.on("data", (data) => {
  console.log("Data: " + data.toString());
});

pyProcess.stderr.on("data", (data) => {
  console.log("Err: " + data.toString());
});

pyProcess.on('exit', (code, signal) => {
  console.log(code, signal);
  if (code === 0 && signal === null) {
    console.log(`Python process closed by user. Quitting Dev reload`);
    process.exit();
  }
});

process.on('exit', (code) => {
  console.log(`Closing pequena window.`);
  killProcess(pyProcess.pid);
});

process.on('SIGINT', () => {
  killProcess(pyProcess.pid);
});

const fs = require('fs');

const watchFile = './client';

fs.watch(watchFile, { recursive: true }, async () => {
  console.log('Changes detected, restarting Pequena app...');
  await killProcess(pyProcess.pid, true);
  pyProcess = spawnInEnv("python Pequena/main.py");
});
