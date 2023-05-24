const { spawn, execSync, spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { convertPyTypes, killProcess, extractNames, copyFolderSync, generateRandomString } = require("./addons/functions.js")

let HTML_NAME = "index.html"
const BUILD_DIR = "./Pequena/build/";
const MAIN_FC_NAME = generateRandomString(10)

const DEFAULT_VALUES = {
  "title": "Hello world!",
  "src": "./client/index.html",
  "width": 800,
  "height": 600,
  "x": "center",
  "y": "center",
  "min_x": 200,
  "min_y": 100,
  "resizable": true,
  "fullscreen": false,
  "hidden": false,
  "frameless": false,
  "easy_drag": true,
  "minimized": false,
  "on_top": false,
  "confirm_close": false,
  "background_color": "#FFFFFF",
  "transparent": false,
  "text_select": false,
  "zoomable": false,
  "draggable": false,
  "debug": false
}
const BASE_SCRIPT = `
<script>
    window.addEventListener('pywebviewready', function () {
        const __Pequena__ = pywebview.api.PequenaApi;
        const __Node__ = pywebview.api.NodeApi
        const __Exposed__ = pywebview.api.exposed
        ${MAIN_FC_NAME}(__Pequena__,__Node__,__Exposed__)
      })

  async function ${MAIN_FC_NAME}(__Pequena__,__Node__,__Exposed__){
`;

let filesToDelete = []



// Used to build the main.py file.
function buildMain() {
  let settings = JSON.parse(fs.readFileSync("./settings.json"))
  for (let key in DEFAULT_VALUES) {
    settings[key] = convertPyTypes(settings[key], key)
  }

  const PYTHON_ARGS = `window_name=${settings.title}, src=html_path, width=${settings.width}, height=${settings.height},
  x=${settings.x}, y=${settings.y}, resizable=${settings.resizable}, fullscreen=${settings.fullscreen}, min_size=(${settings.min_x}, ${settings.min_y}),
  hidden=${settings.hidden}, frameless=${settings.frameless}, easy_drag=${settings.easy_drag},
  minimized=${settings.minimized}, on_top=${settings.on_top}, confirm_close=${settings.confirm_close}, background_color=${settings.background_color},
  transparent=${settings.transparent}, text_select=${settings.text_select}, zoomable=${settings.zoomable}, draggable=${settings.draggable}`

  const PYTHON_START = `import sys
if getattr(sys, 'frozen', False):
  html_path = "./Pequena/build/${HTML_NAME}"
else:
  html_path = "./build/${HTML_NAME}"
    
window = Pequena.init_window(${PYTHON_ARGS})`

  const PYTHON_END = `\nPequena.start_window(debug=${settings.debug})`

  let data = fs.readFileSync("./main.py", "utf-8")

  data = data.replace(/^.*Pequena\.init_window\(.*/gm, PYTHON_START)

  data = data.replace(/global\./g, MAIN_FC_NAME + ".");

  data += PYTHON_END
  fs.writeFileSync("./Pequena/main.py", data)
}

async function handleUserPyModules(modules) {
  for (let module of modules) {
    console.log("Installing custom module: " + module)
    let res = await spawnInEnv(`pip install ${module}`, true)
  }
}

function spawnInEnv(cmd, sync = false) {
  const venvActivateFile = process.platform === 'win32' ? 'activate.bat' : 'activate';
  const activateCmd = process.platform === 'win32' ? `"${__dirname}/Scripts/${venvActivateFile}"` : `source "${__dirname}/Scripts/${venvActivateFile}"`;
  if (sync)
    return spawnSync(`${activateCmd} && ${cmd}`, [], { shell: true });
  return spawn(`${activateCmd} && ${cmd}`, [], { shell: true });
}

async function checkForEnv() {
  if (!fs.existsSync(path.join(__dirname, "Lib", "site-packages")) || !fs.existsSync(path.join(__dirname, "Scripts")) || !fs.existsSync(path.join(__dirname, "pyvenv.cfg"))) {
    let pyPath = "py"
    try {
      execSync('python --version');
      pyPath = "python"
      console.log("Found python, looking for pip")
    } catch (e) {
      console.log('Python is not installed. Looking for Python 3!');
      try {
        execSync('python3 --version');
        pyPath = "python3"
      } catch (e) {
        console.log('Python3 is not installed. Looking for Py!');
        try {
          execSync('py --version');
          pyPath = "py"
        } catch (e) {
          console.error('Neither python nor python3 or py is installed. Please install it before using Pequena');
          process.exit(1);
        }
      }
    }

    // check if pip is installed
    try {
      execSync(`${pyPath} -m pip --version`);
      console.log("Found pip, initializing venv")
    } catch (e) {
      console.log(`Could not find pip in ${pyPath}. Looking for global pip.`);
      try {
        execSync('pip --version');
      } catch (e) {
        console.error('Pip is not installed. Please install Pip before using this package.');
        process.exit(1);
      }
    }

    // Initialize a new virtual environment
    console.log("Initializing new env")
    let res = await execSync(`${pyPath} -m venv Pequena`);
    return res
  }
  let { py_modules } = JSON.parse(fs.readFileSync("./settings.json"))
  handleUserPyModules(py_modules)
  return true
}

async function checkForPequena() {
  if (!fs.existsSync(path.join(__dirname, "Lib", "site-packages", "Pequena"))) {
    console.log("Installing Pequena")
    let res = await spawnInEnv(`pip install Pequena`, true)
  }
}

function checkForModules(jsPath) {
  const scriptDir = path.dirname(jsPath);
  filesToDelete.push(jsPath)
  let scriptStr = "";
  const scriptContent = fs.readFileSync(jsPath, "utf-8");

  const lines = scriptContent.split('\n');
  for (let line of lines) {
    if (line.includes("import")) {
      const importRegex = /from ['"](.+)['"]/;
      const modulePath = path.join(scriptDir, importRegex.exec(line)[1]);
      scriptStr += checkForModules(modulePath);
    } else {
      if (!line.includes("export  {"))
        scriptStr += line.replace("export ", "") + "\n";

    }
  }
  return scriptStr + "\n";
}

function buildClient() {
  let settings = JSON.parse(fs.readFileSync("./settings.json"));
  let clientHtml = settings.src;
  let clientDir = path.dirname(clientHtml);
  HTML_NAME = path.basename(clientHtml);
  let buildHtml = `${BUILD_DIR}/${HTML_NAME}`;

  if (!fs.existsSync(clientDir)) {
    console.log("Client directory " + clientDir + " does not exist");
    process.exit(1);
  }

  copyFolderSync(clientDir, BUILD_DIR);

  let scriptStr = "";
  let newHtml = "";
  const htmlContent = fs.readFileSync(clientHtml, "utf-8");
  let isScriptOpen = false;
  const lines = htmlContent.split("\n");

  for (let line of lines) {
    if (line.includes("<script")) {
      if (line.includes("src=")) {
        if (!line.includes("https://") && !line.includes("http://")) {
          const fileRegex = /(?:src)="([^"]+)"/;
          const jsPath = path.join(path.dirname(clientHtml), fileRegex.exec(line)[1]);
          if (line.includes('type="module"')) {
            scriptStr += checkForModules(jsPath);
          } else {
            const fileContent = fs.readFileSync(jsPath, "utf-8");
            filesToDelete.push(jsPath)
            scriptStr += fileContent + "\n";
          }
        } else {
          newHtml += line;
        }
      } else {
        isScriptOpen = true;
      }
    } else if (line.includes("</script")) {
      isScriptOpen = false;
    } else if (line.includes("<link") && line.includes("rel=\"stylesheet\"") && line.includes("href=")) {
      const fileRegex = /(?:href)="([^"]+)"/;
      const cssPath = path.join(path.dirname(clientHtml), fileRegex.exec(line)[1]);
      filesToDelete.push(cssPath)
      const fileContent = fs.readFileSync(cssPath, "utf-8");
      newHtml += `<style>${fileContent}</style>`;
    } else {
      if (isScriptOpen) {
        scriptStr += line;
      } else {
        newHtml += line;
      }
    }
  }


  scriptStr = scriptStr.replace(/const /g, "var  ") // Prevent redeclaring error
  let initedFunctions = extractNames(scriptStr, MAIN_FC_NAME)
  newHtml = newHtml.replace("</body>", BASE_SCRIPT + "\n" + scriptStr + "\n" + initedFunctions + "}</script>\n</body>");

  fs.writeFileSync(buildHtml, newHtml);
  filesToDelete = [...new Set(filesToDelete)]
  for (file of filesToDelete) {
    fs.unlinkSync("./Pequena/" + file.replace("client", "build"))
  }
}


module.exports = { spawnInEnv, checkForEnv, checkForPequena, killProcess, buildMain, buildClient }
