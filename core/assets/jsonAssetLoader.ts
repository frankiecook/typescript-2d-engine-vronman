namespace TSE {

	export class JsonAsset implements IAsset {

		public readonly name: string;

		public readonly data: any;

		public constructor(name: string, data: HTMLImageElement) {
			this.name = name;
			this.data = data;
		}
	}

	export class JsonAssetLoader implements IAssetLoader {

		// extensions that most browsers support
		public get supportedExtensions(): string[] {
			return ["json"];
		}

		public loadAsset(assetName: string): void {
			// tell the browser to make a request for a browser
			// GET request is a type of request for said file
			let request: XMLHttpRequest = new XMLHttpRequest();
			request.open("GET", assetName);
			request.addEventListener("load", this.onJsonLoaded.bind(this, assetName, request));
			// send request
			request.send();
		}

		// JSON loaded event
		private onJsonLoaded(assetName: string, request: XMLHttpRequest): void {
			console.log("onJsonLoaded: assetName/request", assetName, request);

			// check if the request is fully loaded
			if (request.readyState === request.DONE) {
				// basic JSON parsing
				let json = JSON.parse(request.responseText);
				// responseText contains the string of the request file
				let asset = new JsonAsset(assetName, json);
				AssetManager.onAssetLoaded(asset);	// register into asset dictionary
			}
		}
	}
}