namespace TSE {

	export const MESSAGE_ASSET_LOADER_ASSET_LOADED = "MESSAGE_ASSET_LOADER_ASSET_LOADED::";

	export class AssetManager {

		private static _loaders: IAssetLoader[] = [];
		private static _loadedAssets: { [name: string]: IAsset } = {}; // access asset by name in dictionary


		// private - dont want to accidentally call it 
		private constructor() {

		}

		// register loaders
		public static initialize(): void {
			AssetManager._loaders.push(new ImageAssetLoader());
			AssetManager._loaders.push(new JsonAssetLoader());
			AssetManager._loaders.push(new TextAssetLoader());
		}

		// add a loader for us to use
		// asumes that the loader passed in is unique
		public static registerLoader(loader: IAssetLoader): void {
			AssetManager._loaders.push(loader);
		}

		// send message to members that need to know when the asset is loaded
		public static onAssetLoaded(asset: IAsset): void {
			AssetManager._loadedAssets[asset.name] = asset;
			Message.send(MESSAGE_ASSET_LOADER_ASSET_LOADED + asset.name, this, asset);
		}

		public static loadAsset(assetName: string): void {
			// grabs the extension by splitting the string between periods
			// randomname.txt ==> randomname '.' txt ==> txt
			let extension = assetName.split('.').pop().toLowerCase();
			for (let l of AssetManager._loaders) {
				// if we find something to handle then return
				if (l.supportedExtensions.indexOf(extension) !== -1) {
					l.loadAsset(assetName);
					return;
				}
			}

			console.warn("unable to load asset with extension " + extension + "because there is no loader associated with it.");
		}

		// if our dictionary has an asset with this name AND it's loaded return true
		public static isAssetLoaded(assetName: string): boolean {
			return AssetManager._loadedAssets[assetName] !== undefined;
		}

		// if asset exists return asset, if not then load it and return undefined
		public static getAsset(assetName: string): IAsset {
			console.log("ASSET MANAGER~~~~~~~~~~~~~~~~~~~~~~~~~~~");
			console.log(AssetManager._loadedAssets);
			if (AssetManager._loadedAssets[assetName] !== undefined) {
				return AssetManager._loadedAssets[assetName];
			} else {
				AssetManager.loadAsset(assetName);
			}

			return undefined;
		}
	}
}