# Pequena
Pequena is a desktop creation framework that allows you to create desktop applications using web technologies such as HTML, CSS, and JavaScript. It is built on top of the [webview](https://pypi.org/project/pywebview/) library for Python.
It is supposed to be lightweight and easy to use, while keeping all the complex stuff.

**Visit website:[Pequena](https://pequena.netlify.app/)**

## Installation
Pequena can be installed using npm
```bash
npm install pequena
```

## Usage
After the installation, `main.py` and `settings.json` should appear in your root folder together with `Pequena/` folder.
`Main.py` content should look like this:
```python
import Pequena

window = Pequena.init_window()
``` 

Go to the `settings.json` and change the `src` attribute to an actual client directory and you are ready to go!
Default value is `./client/index.html`
PS: Index.html has to be in another folder than main.py. So I highly recommend using `client/` directory where all your frontend lives.

#### Running the app
Now you can run your app using
```bash
npm run start
```
The first run will take longer as it creates a virtual enviroment for the python to achieve minimal size.

Or you can use hot-reload functionality
```bash
npm run dev
```

#### Exposing functions
You can expose Python functions to your client-side JavaScript code by using the `expose_functions` function:
```python
def my_function():
    return "Hello, World!"
Pequena.expose_functions(my_function)
``` 

In your client-side JavaScript code, you can then call the Python **Pequena** function using the `__Exposed__` object:
```Javascript
const result = await __Exposed__.my_function();
```

In your client-side JavaScript code, you also access the **Node** object itself using the `__Node__` object:
```Javascript
const file = await __Node__.fs.readFile("./hello.txt");
```
There are some prebuilt ones: *fs.readFile*, *fs.writeFile*, *fs.mkdir*, *fs.readdir*, *fs.pathExists*, *fs.isfile*, *fs.isdir*, *path.join*, *path.basename*, *path.dirname*, *path.resolve*. More of them is comming soon with a better documentation.


#### Compiling
To compile the app pequena uses pyinstaller. The script in `package.json` comes with default settings which should work optimaly.
So you can run this command:
```bash
npm run build
```
A single binary file will be created in `dist/` folder.

>
> Compiling to mobile apps is comming! But it will propably take a while. But you can definitely help!!
> 

## Contributing

Contributions are always welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request on the [Github-publisher repository](https://github.com/Borecjeborec1/Pequena).

I will be very glad for any kind of feedback!

## License
Pequena is licensed under the [MIT License](./LICENSE).