namespace TSE {

	/**
	 * An asset loader is responsible for loading specific types of assets and populating the data
	 * All asset loaders have a certain number of properties that are common to all of them
	 */
	export interface IAssetLoader {

		// file extensions .png etc.
		readonly supportedExtensions: string[];

		loadAsset(assetName: string): void;
	}
}