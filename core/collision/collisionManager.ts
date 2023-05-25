namespace TSE {

	export class CollisionData {
		public a: CollisionComponent;
		public b: CollisionComponent;
		public time: number;

		public constructor(time: number, a: CollisionComponent, b: CollisionComponent) {
			this.time = time;
			this.a = a;
			this.b = b;
		}
	}

	export class CollisionManager {

		private static _totalTime: number = 0;

		private static _components: CollisionComponent[] = [];

		private static _collisionData: CollisionData[] = [];

		private constructor() {

		}

		public static registerCollisionComponent(component: CollisionComponent): void {
			CollisionManager._components.push(component);
		}

		public static unRegisterCollisionComponent(component: CollisionComponent): void {
			let index = CollisionManager._components.indexOf(component);
			if (index !== -1) {
				CollisionManager._components.slice(index, 1);
			}
		}

		public static clear(): void {
			CollisionManager._components.length = 0;
		}

		/**
		 * check for collision with each collision component
		 * @param time
		 */
		public static update(time: number): void {
			// inefficient way of checking against all other components in the scene
			// okay solution for now [sweep type method instead]
			CollisionManager._totalTime += time;
			for (let c = 0; c < CollisionManager._components.length; ++c) {

				let comp = CollisionManager._components[c];
				for (let o = 0; o < CollisionManager._components.length; ++o) {
					let other = CollisionManager._components[o];

					// do not check against collisions with self
					if (comp === other) {
						continue;
					}

					// optimization
					// if both shapes are static, stop detection
					if (comp.isStatic && other.isStatic) {
						continue;
					}

					// intercept check
					if (comp.shape.intersect(other.shape)) {

						// we have a collision!
						let exists: boolean = false;
						for (let d = 0; d < CollisionManager._collisionData.length; ++d) {
							let data = CollisionManager._collisionData[d];

							// two conditions for exisiting collision data
							if ((data.a === comp && data.b === other) || (data.a === other || data.b === comp)) {
								// we have exisitng data. update it.
								// onCollisionUpdate
								comp.onCollisionUpdate(other);
								other.onCollisionUpdate(comp);
								data.time = CollisionManager._totalTime;
								exists = true;
								break;
							}
						}

						if (!exists) {

							// create a new collision
							let col = new CollisionData(CollisionManager._totalTime, comp, other);
							comp.onCollisionEntry(other);
							other.onCollisionEntry(comp);
							// two messages to whoever is listening to this collision
							Message.sendPriority("COLLISION_ENTRY:" + comp.name, this, col);
							Message.sendPriority("COLLISION_ENTRY:" + other.name, this, col);
							this._collisionData.push(col);
						}
					}
				}
			}

			/**
			 * locate collisions from the previous frame and delete them
			 */
			let removeData: CollisionData[] = [];
			for (let d = 0; d < CollisionManager._collisionData.length; ++d) {
				let data = CollisionManager._collisionData[d];
				if (data.time !== CollisionManager._totalTime) {

					// old collision data
					removeData.push(data);
				}
			}

			// remove the stale data
			while (removeData.length !== 0) {

				let data = removeData.shift();
				let index = CollisionManager._collisionData.indexOf(removeData[0]);
				CollisionManager._collisionData.splice(index, 1);

				data.a.onCollisionExit(data.b);
				data.a.onCollisionExit(data.a);
				Message.sendPriority("COLLISION_EXIT:" + data.a.name, this, data);
				Message.sendPriority("COLLISION_EXIT:" + data.b.name, this, data);
			}
		}
	}
}