const { spawnInEnv, checkForEnv, checkForPequena, killProcess, buildMain, buildClient } = require("./lib.js")

checkForEnv()
checkForPequena()

buildClient()

buildMain()


const pyProcess = spawnInEnv("python Pequena/main.py");

pyProcess.stdout.on("data", (data) => {
  console.log("Data: " + data.toString());
});

pyProcess.stderr.on("data", (data) => {
  console.log("Err: " + data.toString());
});


process.on('exit', (code) => {
  console.log(`Closing pequena window.`);
  killProcess(pyProcess.pid)
});

process.on('SIGINT', () => {
  killProcess(pyProcess.pid)
});
