namespace TSE {

	// implement IMessageHandler for loading zones
	export class ZoneManager implements IMessageHandler {

		// hashmap of zones
		// globalZoneID is a globally incrmeenting number to populate the zone
		private static _globalZoneID: number = -1;
		//private static _zones: { [id: number]: Zone } = {};
		private static _registeredZones: { [id: number]: string } = {}
		// only one zone loadded in at a time
		private static _activeZone: Zone;
		private static _inst: ZoneManager;

		/**
		 * everything done in this class is done statically
		 */
		private constructor() {
		}

		public static initialize(): void {
			// private instance of ZoneManager that is hidden in the class
			ZoneManager._inst = new ZoneManager();

			// TEMPORARY
			ZoneManager._registeredZones[0]="assets/zones/testZone.json"
		}

		// change the active zone
		public static changeZone(id: number): void {
			// check that the active zone is not undefined and deactivate the zone
			if (ZoneManager._activeZone !== undefined) {
				ZoneManager._activeZone.onDeactivated();
				ZoneManager._activeZone.unload();
				ZoneManager._activeZone = undefined;
			}

			// check if the zone is a registered zone
			if (ZoneManager._registeredZones[id] !== undefined) {
				// check if the zone is loaded
				if (AssetManager.isAssetLoaded(ZoneManager._registeredZones[id])) {
					let asset = AssetManager.getAsset(ZoneManager._registeredZones[id]);
					ZoneManager.loadZone(asset);
				} else {
					Message.subscribe(MESSAGE_ASSET_LOADER_ASSET_LOADED + ZoneManager._registeredZones[id], ZoneManager._inst);
					AssetManager.loadAsset(ZoneManager._registeredZones[id]);
				}
			} else {
				throw new Error("Zone id:" + id.toString() + "does not exist.");
			}
		}

		public static update(time: number): void {
			if (ZoneManager._activeZone !== undefined) {
				ZoneManager._activeZone.update(time);
			}
		}

		public static render(shader: Shader): void {
			if (ZoneManager._activeZone !== undefined) {
				ZoneManager._activeZone.render(shader);
			}
		}

		public onMessage(message: Message): void {
			if (message.code.indexOf(MESSAGE_ASSET_LOADER_ASSET_LOADED) !== -1) {
				let asset = message.context as JsonAsset;
				ZoneManager.loadZone(asset);
			}
		}

		// handles loading of the zone from the asset
		private static loadZone(asset: JsonAsset): void {
			// extract properties from JSON
			let zoneData = asset.data;

			// check for a zone id
			let zoneId: number;
			if (zoneData.id === undefined) {
				throw new Error("Zone file format exception: Zone id not present.");
			} else {
				// very common to use these type functions in excraction
				zoneId = Number(zoneData.id);
			}

			// check for a zone name
			let zoneName: string;
			if (zoneData.name === undefined) {
				throw new Error("Zone file format exception: Zone name not present.");
			} else {
				// very common to use these type functions in excraction
				zoneName = String(zoneData.name);
			}

			// check for a zone desciription
			// not mandatory
			let zoneDescription: string;
			if (zoneData.description !== undefined) {
				zoneDescription = String(zoneData.description);
			}

			ZoneManager._activeZone = new Zone(zoneId, zoneName, zoneDescription);
			ZoneManager._activeZone.initialize(zoneData);
			ZoneManager._activeZone.onActivated();
			ZoneManager._activeZone.load();

			// Game is ready
			// Change state to splash
			Message.send("GAME_READY", this);
		}
	}
}