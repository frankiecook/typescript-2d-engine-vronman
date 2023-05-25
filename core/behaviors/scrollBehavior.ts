﻿namespace TSE {

	export class ScrollBehaviorData implements IBehaviorData {
		public name: string;
		public velocity: Vector2 = Vector2.zero;
		public minPosition: Vector2 = Vector2.zero;
		public resetPosition: Vector2 = Vector2.zero;
		public startMessage: string;
		public stopMessage: string;
		public resetMessage: string;

		public setFromJson(json: any): void {
			if (json.name === undefined) {
				throw new Error("Name must be defined in behavior data.");
			}

			this.name = String(json.name);

			if (json.startMessage !== undefined) {
				this.startMessage = String(json.startMessage);
			}

			if (json.stopMessage !== undefined) {
				this.stopMessage = String(json.stopMessage);
			}

			if (json.resetMessage !== undefined) {
				this.resetMessage = String(json.resetMessage);
			}

			if (json.velocity !== undefined) {
				this.velocity.setFromJson(json.velocity);
			} else {
				throw new Error("ScrollBehaviorData requires property 'velocity' to be defined!");
			}

			if (json.minPosition !== undefined) {
				this.minPosition.setFromJson(json.minPosition);
			} else {
				throw new Error("ScrollBehaviorData requires property 'minPosition' to be defined!");
			}

			if (json.resetPosition !== undefined) {
				this.resetPosition.setFromJson(json.resetPosition);
			} else {
				throw new Error("ScrollBehaviorData requires property 'resetPosition' to be defined!");
			}
		}
	}

	export class ScrollBehaviorBuilder implements IBehaviorBuilder {

		public get type(): string {
			return "scroll";
		}

		public buildFromJson(json: any): IBehavior {
			let data = new ScrollBehaviorData();
			data.setFromJson(json);
			return new ScrollBehavior(data);
		}
	}

	export class ScrollBehavior extends BaseBehavior implements IMessageHandler {
		private _velocity: Vector2 = Vector2.zero;
		private _minPosition: Vector2 = Vector2.zero;
		private _resetPosition: Vector2 = Vector2.zero;
		private _startMessage: string;
		private _stopMessage: string;
		private _resetMessage: string;
		private _isScrolling: boolean = false;
		private _initialPosition: Vector2 = Vector2.zero;

		public constructor(data: ScrollBehaviorData) {
			super(data);

			this._velocity.copyFrom(data.velocity);
			this._minPosition.copyFrom(data.minPosition);
			this._resetPosition.copyFrom(data.resetPosition);
			this._startMessage = data.startMessage;
			this._stopMessage = data.stopMessage;
			this._resetMessage = data.resetMessage;
		}

		public updateReady(): void {
			super.updateReady();

			if (this._startMessage !== undefined) {
				Message.subscribe(this._startMessage, this);
			}

			if (this._stopMessage !== undefined) {
				Message.subscribe(this._stopMessage, this);
			}

			if (this._resetMessage !== undefined) {
				Message.subscribe(this._resetMessage, this);
			}

			// update initial position
			// VECTOR 2 TEMPORARY
			this._initialPosition.copyFrom(this._owner.transform.position.toVector2());
		}

		public update(time: number): void {
			if (this._isScrolling) {
				// scale time to be in seconds
				this._owner.transform.position.add(this._velocity.clone().scale(time / 1000).toVector3());

				if (this._owner.transform.position.x <= this._minPosition.x &&
					this._owner.transform.position.y <= this._minPosition.y) {
					this.reset();
				}
			}
		}

		public onMessage(message: Message): void {
			if (message.code === this._startMessage) {
				this._isScrolling = true;
			} else if (message.code === this._stopMessage) {
				this._isScrolling = false;
			} else if (message.code === this._resetMessage) {
				this.initial();
			}
		}

		private reset(): void {
			this._owner.transform.position.copyFrom(this._resetPosition.toVector3());
		}

		private initial(): void {
			this._owner.transform.position.copyFrom(this._resetPosition.toVector3());
		}
	}

	// add behavior to manager
	BehaviorManager.registerBuilder(new ScrollBehaviorBuilder());
}