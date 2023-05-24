const { spawnInEnv, checkForEnv, checkForPequena, killProcess, buildMain, buildClient } = require("./lib.js")

checkForEnv()
checkForPequena()

buildClient()

buildMain()


const pyProcess = spawnInEnv("python -u Pequena/main.py");

pyProcess.stdout.on("data", (data) => {
  console.log("Data: " + data.toString());
});

pyProcess.stderr.on("data", (data) => {
  data = data.toString()
  // if (data.includes("127.0.0") || data.includes("Bottle") || data.includes("pywebview") || data.includes("Hit Ctrl-C to quit"))
  //   return
  console.log("Err: " + data.toString());
});
pyProcess.on("exit", e => {
  console.log("exited pyProcess")
  killProcess(pyProcess.pid)
  process.exit()
})


process.on('exit', (code) => {
  console.log(`Closing pequena window.`);
  killProcess(pyProcess.pid)
});

process.on('SIGINT', () => {
  killProcess(pyProcess.pid)
});
