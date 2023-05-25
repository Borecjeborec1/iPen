const { spawnInEnv, checkForEnv, checkForPequena, killProcess } = require("./lib.js")
const fs = require("fs")

checkForEnv()
checkForPequena()

async function checkForPyinstaller() {
  let res = await spawnInEnv(`pip install pyinstaller`, true)
  return res
}

checkForPyinstaller()
let settings = JSON.parse(fs.readFileSync("./settings.json"))
let appName = (settings.name || settings.title)
let icon = settings.icon ?
  fs.existsSync(settings.icon) ?
    `--icon ${settings.icon}` : "" : ""

const buildProcess = spawnInEnv(`pyinstaller --onefile --noconsole ./Pequena/main.py ${icon} --name ${appName} --distpath ./dist/ --workpath Pequena/tmp/ --upx-dir ./Pequena/UPX/ --add-data=Pequena/build;Pequena/build`)


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