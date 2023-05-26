namespace TSE {

	export class BitmapFontManager {

		private static _fonts: { [name: string]: BitmapFont } = {}

		public static addFont(name: string, fontFileName: string): void {
			BitmapFontManager._fonts[name] = new BitmapFont(name, fontFileName);
		}

		public static getFont(name: string): BitmapFont {
			if (BitmapFontManager._fonts[name] === undefined) {
				throw new Error("A font named " + name + " does not exist.");
			}

			return BitmapFontManager._fonts[name];
		}

		/**
		* Load any registered fonts 
		*/
		public static load(): void {
			let keys = Object.keys(BitmapFontManager._fonts);
			for (let key of keys) {
				BitmapFontManager._fonts[key].load();
			}
		}

		/**
		 * Check if fonts are loaded
		 */
		public static updateReady(): boolean {
			let keys = Object.keys(BitmapFontManager._fonts);
			for (let key of keys) {
				if (!BitmapFontManager._fonts[key].isLoaded) {
					console.debug("Font " + key + " is still laoding...");
					return false;
				}
			}

			console.debug("All fonts are loaded.");
			return true
		}
	}
}