﻿/// <reference path="../math/vector2.ts" />

namespace TSE {

	/**
	 * keys that exist outside of the Input Manager
	 */
	export enum Keys {
		LEFT = 37,
		UP = 38,
		RIGHT = 39,
		DOWN = 40
	}

	/**
	 * context of the mouse for sending messages
	 */
	export class MouseContext {
		public leftDown: boolean;
		public rightDown: boolean;
		public position: Vector2;

		public constructor(leftDown: boolean, rightDown: boolean, position: Vector2) {
			this.leftDown = leftDown;
			this.rightDown = rightDown;
			this.position = position;
		}
	}

	export class InputManager {

		private static _keys: boolean[] = [];
		private static _previousMouseX: number;
		private static _previousMouseY: number;
		private static _mouseX: number;
		private static _mouseY: number;
		private static _leftDown: boolean = false;
		private static _rightDown: boolean = false;
		private static _resolutionScale: Vector2 = Vector2.zero;

		public static initialize(viewport: HTMLCanvasElement): void {
			// default all keys to false, no input
			for (let i = 0; i < 255; ++i) {
				InputManager._keys[i] = false;
			}

			window.addEventListener("keydown", InputManager.onKeyDown);
			window.addEventListener("keyup", InputManager.onKeyUp);

			viewport.addEventListener("mousemove", InputManager.onMouseMove);
			viewport.addEventListener("mousedown", InputManager.onMouseDown);
			viewport.addEventListener("mouseup", InputManager.onMouseUp);
		}

		public static isKeyDown(key: Keys): boolean {
			return InputManager._keys[key];
		}

		public static getMousePosition(): Vector2 {
			return new Vector2(InputManager._mouseX, InputManager._mouseY);
		}

		public static setResolutionScale(scale: Vector2): void {
			InputManager._resolutionScale.copyFrom(scale);
		}

		/**
		 * Capture our key events
		 */
		private static onKeyDown(event: KeyboardEvent): boolean {
			InputManager._keys[event.keyCode] = true;
			return true;
			// temporarily disabling and returning true
			// cross browser way to say don't allow this event to be handled by anything else
			//event.preventDefault();
			//event.stopPropagation();
			//return false;
		}

		private static onKeyUp(event: KeyboardEvent): boolean {
			InputManager._keys[event.keyCode] = false;
			return true;
			// temporarily disabling and returning true
			// cross browser way to say don't allow this event to be handled by anything else
			//event.preventDefault();
			//event.stopPropagation();
			//return false;
		}

		/**
		 * capture the movement of the mouse
		 */
		private static onMouseMove(event: MouseEvent): void {
			InputManager._previousMouseX = InputManager._mouseX;
			InputManager._previousMouseY = InputManager._mouseY;

			let rect = (event.target as HTMLElement).getBoundingClientRect();
			InputManager._mouseX = (event.clientX - Math.round(rect.left)) * (1 / InputManager._resolutionScale.x);
			InputManager._mouseY = (event.clientY - Math.round(rect.top)) * (1 / InputManager._resolutionScale.y);
		}

		/**
		 * capture mouse buttons
		 */
		private static onMouseDown(event: MouseEvent): void {
			// scrollwheel click is number 1
			if (event.button === 0) {
				this._leftDown = true;
			} else if (event.button === 2) {
				this._rightDown = true;
			}

			Message.send("MOUSE_DOWN", this, new MouseContext(InputManager._leftDown, InputManager._rightDown, InputManager.getMousePosition()));
		}

		private static onMouseUp(event: MouseEvent): void {
			// scrollwheel click is number 1
			if (event.button === 0) {
				this._leftDown = false;
			} else if (event.button === 2) {
				this._rightDown = false;
			}

			Message.send("MOUSE_UP", this, new MouseContext(InputManager._leftDown, InputManager._rightDown, InputManager.getMousePosition()));
		}
	}
}