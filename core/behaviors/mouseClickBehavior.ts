﻿namespace TSE {

	export class MouseClickBehaviorData implements IBehaviorData {
		public name: string;
		public width: number;
		public height: number;
		public messageCode: string;

		public setFromJson(json: any): void {
			if (json.name === undefined) {
				throw new Error("Name must be defined n behavior data.");
			}

			this.name = String(json.name);

			if (json.width === undefined) {
				throw new Error("Width must be defined n behavior data.");
			} else {
				this.width = Number(json.width);
			}

			if (json.height === undefined) {
				throw new Error("height must be defined n behavior data.");
			} else {
				this.height = Number(json.height);
			}

			if (json.messageCode === undefined) {
				throw new Error("messageCode must be defined n behavior data.");
			} else {
				this.messageCode = String(json.messageCode);
			}
		}
	}

	export class MouseClickBehaviorBuilder implements IBehaviorBuilder {
		public get type(): string {
			return "mouseClick";
		}

		public buildFromJson(json: any): IBehavior {
			let data = new MouseClickBehaviorData();
			data.setFromJson(json);
			return new MouseClickBehavior(data);
		}
	}

	export class MouseClickBehavior extends BaseBehavior implements IMessageHandler {

		private _width: number;
		private _height: number;
		private _messageCode: string;

		public constructor(data: MouseClickBehaviorData) {
			super(data);

			this._width = data.width;
			this._height = data.height;
			this._messageCode = data.messageCode;
			Message.subscribe("MOUSE_UP", this);
		}

		public onMessage(message: Message): void {
			if (message.code === "MOUSE_UP") {
				if (!this._owner.isVisible) {
					return;
				}
				let context = message.context as MouseContext;
				let worldPos = this._owner.getWorldPosition();
				let extentsX = worldPos.x + this._width;
				let extentsY = worldPos.y + this._height;
				if (context.position.x >= worldPos.x && context.position.x <= extentsX &&
					context.position.y >= worldPos.y && context.position.y <= extentsY) {
						// send the configured message
					Message.send(this._messageCode, this);
					}
			}
		}
	}

	// add behavior to manager
	BehaviorManager.registerBuilder(new MouseClickBehaviorBuilder());
}