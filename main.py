import Pequena
import mouse
import keyboard
from threading import Thread
import ctypes

window = Pequena.init_window()

is_mouse_down = False
is_going_down = False
mousePosX = 0
mousePosY = 0

is_closed = False


HIDE_KEY = "h"
UNHIDE_KEY = "ctrl+h"
QUIT_KEY = "q"
RUBBER_KEY = "e"
PEN_KEY = "p"
CIRCLE_KEY = "o"
TRIANGLE_KEY = "t"
SQUARE_KEY = "s"
RECTANGLE_KEY = "r"
LASER_KEY = "l"
RIGHT_KEY = "right"
LEFT_KEY = "left"
CLEAR_KEY = "c"

import time
user32 = ctypes.windll.user32

def handle_mouse_hook(e: tuple) -> None:
    if is_closed:
        return

    global is_mouse_down
    global is_going_down
    global mousePosX
    global mousePosY
    if type(e) == mouse.MoveEvent:
        mousePosX = e.x
        mousePosY = e.y
        if is_mouse_down:
            current_time = time.time()
            if hasattr(handle_mouse_hook, "last_call"):
                elapsed_time = current_time - handle_mouse_hook.last_call
                if elapsed_time < 0.005:  # Adjust the delay value als needed
                        return

            handle_mouse_hook.last_call = current_time

            window.evaluate_js("global.handleDrag({0},{1})".format(e.x, e.y,))
    elif type(e) == mouse.ButtonEvent:
        if e.event_type == "up":
            if is_going_down:
                is_going_down = False
                return
            window.evaluate_js(
                "global.handleDrag({0},{1})".format(mousePosX, mousePosY))
            window.evaluate_js(
                "global.setStart({0},{1})".format(mousePosX, mousePosY))
            is_mouse_down = False
        else:
            window.evaluate_js(
                "global.setPosition({0},{1})".format(mousePosX, mousePosY))
            window.evaluate_js(
                "global.setStart({0},{1})".format(mousePosX, mousePosY))
            is_mouse_down = True
            is_going_down = True
            user32.mouse_event(0x0004, 0, 0, 0, 0) 

def handle_key_hook(e: tuple) -> None:
    global is_closed
    if e.event_type == "down":
        if e.name == "shift":
            window.evaluate_js("global.setShift(true)")
        elif e.name == RIGHT_KEY:
            window.evaluate_js("global.setSize(true)")
        elif e.name == LEFT_KEY:
            window.evaluate_js("global.setSize(false)")

    else:
        if e.name == "shift":
            window.evaluate_js("global.setShift(false)")


mouse.hook(handle_mouse_hook)
keyboard.hook(handle_key_hook)


def mouse_poll_loop():
    mouse.wait()


mouse_thread = Thread(target=mouse_poll_loop)
mouse_thread.daemon = True
mouse_thread.start()


def hide_window():
    global is_closed
    keyboard.remove_hotkey(HIDE_KEY)
    keyboard.add_hotkey(UNHIDE_KEY, open_window, suppress=True)
    remove_hotkeys()
    is_closed = True
    window.hide()


def open_window():
    global is_closed
    keyboard.remove_hotkey(UNHIDE_KEY)
    keyboard.add_hotkey(HIDE_KEY, hide_window, suppress=True)
    add_hotkeys()
    is_closed = False
    window.show()


def add_hotkeys():
    keyboard.add_hotkey(RUBBER_KEY, lambda: window.evaluate_js("global.setItem('rubber')"), suppress=True)
    keyboard.add_hotkey(LASER_KEY, lambda: window.evaluate_js("global.setItem('laser')"), suppress=True)
    keyboard.add_hotkey(PEN_KEY, lambda: window.evaluate_js("global.setItem('pen')"), suppress=True)
    keyboard.add_hotkey(CIRCLE_KEY, lambda: window.evaluate_js("global.setItem('circle')"), suppress=True)
    keyboard.add_hotkey(TRIANGLE_KEY, lambda: window.evaluate_js("global.setItem('triangle')"), suppress=True)
    keyboard.add_hotkey(SQUARE_KEY, lambda: window.evaluate_js("global.setItem('square')"), suppress=True)
    keyboard.add_hotkey(RECTANGLE_KEY, lambda: window.evaluate_js("global.setItem('rectangle')"), suppress=True)
    keyboard.add_hotkey(CLEAR_KEY, lambda: window.evaluate_js("global.clearAll()"), suppress=True)
    keyboard.add_hotkey(QUIT_KEY, lambda: window.destroy(), suppress=True)

def remove_hotkeys():
    keyboard.remove_hotkey(RUBBER_KEY)
    keyboard.remove_hotkey(LASER_KEY)
    keyboard.remove_hotkey(PEN_KEY)
    keyboard.remove_hotkey(CIRCLE_KEY)
    keyboard.remove_hotkey(TRIANGLE_KEY)
    keyboard.remove_hotkey(SQUARE_KEY)
    keyboard.remove_hotkey(RECTANGLE_KEY)
    keyboard.remove_hotkey(CLEAR_KEY)
    keyboard.add_hotkey(QUIT_KEY)



keyboard.add_hotkey(HIDE_KEY, hide_window, suppress=True)
add_hotkeys()