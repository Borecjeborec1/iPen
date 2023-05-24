const { spawnInEnv, checkForEnv, checkForPequena, killProcess } = require("./lib.js")

checkForEnv()
checkForPequena()

async function checkForPyinstaller() {
  let res = await spawnInEnv(`pip install pyinstaller`, true)
  return res
}

checkForPyinstaller()
const buildProcess = spawnInEnv(`pyinstaller --onefile --noconsole ./main.py --distpath ./dist/ --workpath Pequena/tmp/ --add-data=Pequena/build;Pequena/build`)



buildProcess.stdout.on("data", (data) => {
  console.log("Data: " + data.toString());
});
buildProcess.stderr.on("data", (data) => {
  console.log("Err: " + data.toString());
});

process.on('exit', () => {
  killProcess(buildProcess.pid)
});

process.on('SIGINT', () => {
  killProcess(buildProcess.pid)
});