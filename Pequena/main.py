import Pequena
import mouse
import keyboard
from threading import Thread


import sys
if getattr(sys, 'frozen', False):
  html_path = "./Pequena/build/index.html"
else:
  html_path = "./build/index.html"
    
window = Pequena.init_window(window_name="iPen", src=html_path, width=800, height=600,
  x=None, y=None, resizable=False, fullscreen=True, min_size=(200, 100),
  hidden=False, frameless=True, easy_drag=True,
  minimized=False, on_top=True, confirm_close=False, background_color="#000",
  transparent=True, text_select=True, zoomable=False, draggable=False)

is_laser = False
is_mouse_down = False
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


def handle_mouse_hook(e: tuple) -> None:
    if is_closed:
        return

    global is_mouse_down
    global mousePosX
    global mousePosY
    if type(e) == mouse.MoveEvent:
        mousePosX = e.x
        mousePosY = e.y
        if is_mouse_down:
            current_time = time.time()
            if hasattr(handle_mouse_hook, "last_call"):
                elapsed_time = current_time - handle_mouse_hook.last_call
                if is_laser:
                    if elapsed_time < 0.0005:  # Adjust the delay value as needed
                        return
                else:
                    if elapsed_time < 0.005:  # Adjust the delay value as needed
                        return

            handle_mouse_hook.last_call = current_time

            window.evaluate_js("P1fvaghqxg.handleDrag({0},{1})".format(e.x, e.y,))
    elif type(e) == mouse.ButtonEvent:
        if e.event_type == "up":
            window.evaluate_js(
                "P1fvaghqxg.handleDrag({0},{1})".format(mousePosX, mousePosY))
            window.evaluate_js(
                "P1fvaghqxg.setStart({0},{1})".format(mousePosX, mousePosY))
            is_mouse_down = False
        else:
            window.evaluate_js(
                "P1fvaghqxg.setPosition({0},{1})".format(mousePosX, mousePosY))
            window.evaluate_js(
                "P1fvaghqxg.setStart({0},{1})".format(mousePosX, mousePosY))
            is_mouse_down = True


def handle_key_hook(e: tuple) -> None:
    global is_closed
    global is_laser
    if e.event_type == "down":
        is_laser = False
        if e.name == "shift":
            window.evaluate_js("P1fvaghqxg.setShift(true)")
        if e.name == RUBBER_KEY:
            window.evaluate_js("P1fvaghqxg.setItem('rubber')")
        elif e.name == LASER_KEY:
            window.evaluate_js("P1fvaghqxg.setItem('laser')")
            is_laser = True
        elif e.name == PEN_KEY:
            window.evaluate_js("P1fvaghqxg.setItem('pen')")
        elif e.name == CIRCLE_KEY:
            window.evaluate_js("P1fvaghqxg.setItem('circle')")
        elif e.name == TRIANGLE_KEY:
            window.evaluate_js("P1fvaghqxg.setItem('triangle')")
        elif e.name == SQUARE_KEY:
            window.evaluate_js("P1fvaghqxg.setItem('square')")
        elif e.name == RECTANGLE_KEY:
            window.evaluate_js("P1fvaghqxg.setItem('rectangle')")
        elif e.name == RIGHT_KEY:
            window.evaluate_js("P1fvaghqxg.setSize(true)")
        elif e.name == LEFT_KEY:
            window.evaluate_js("P1fvaghqxg.setSize(false)")
        elif e.name == CLEAR_KEY:
            window.evaluate_js("P1fvaghqxg.clearAll()")
    else:
        if e.name == "shift":
            window.evaluate_js("P1fvaghqxg.setShift(false)")


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
    is_closed = True
    window.hide()


def open_window():
    global is_closed
    keyboard.remove_hotkey(UNHIDE_KEY)
    keyboard.add_hotkey(HIDE_KEY, hide_window, suppress=True)
    is_closed = False
    window.show()


def quit_window():
    window.destroy()


keyboard.add_hotkey(HIDE_KEY, hide_window, suppress=True)
keyboard.add_hotkey(QUIT_KEY, quit_window, suppress=True)

Pequena.start_window(debug=False)