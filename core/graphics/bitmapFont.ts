/// <reference path="../engine.ts" />

namespace TSE {

	class FontUtilities {

		// extracts values that are after '=' sign
		public static extractFieldValue(field:string):string {
			return field.split("=")[1];
		}
	}

	export class FontGlyph {
		// order of fields matches order of properties in .fnt file
		public id: number;
		public x: number;
		public y: number;
		public width: number;
		public height: number;
		public xOffset: number;
		public yOffset: number;
		public xAdvance: number;
		public page: number;
		public channel: number;

		public static fromFields(fields: string[]): FontGlyph {
			let glyph: FontGlyph = new FontGlyph();

			glyph.id = Number(FontUtilities.extractFieldValue(fields[1]));
			glyph.x = Number(FontUtilities.extractFieldValue(fields[2]));
			glyph.y = Number(FontUtilities.extractFieldValue(fields[3]));
			glyph.width = Number(FontUtilities.extractFieldValue(fields[4]));
			glyph.height = Number(FontUtilities.extractFieldValue(fields[5]));
			glyph.xOffset = Number(FontUtilities.extractFieldValue(fields[6]));
			glyph.yOffset = Number(FontUtilities.extractFieldValue(fields[7]));
			glyph.xAdvance = Number(FontUtilities.extractFieldValue(fields[8]));
			glyph.page = Number(FontUtilities.extractFieldValue(fields[9]));
			glyph.channel = Number(FontUtilities.extractFieldValue(fields[10]));


			return glyph;
		}
	}

	export class BitmapFont implements IMessageHandler {

		private _name: string;
		private _fontFileName: string;
		private _assetLoaded: boolean = false;
		private _imageFile: string;
		private _glyphs: { [id: number]: FontGlyph } = {};
		private _size: number;
		private _imageWidth: number;
		private _imageHeight: number;

		public constructor(name: string, fontFile: string) {
			this._name = name;
			this._fontFileName = fontFile;
		}

		public get name(): string {
			return this._name;
		}

		public get size(): number {
			return this._size;
		}

		public get imageWidth(): number {
			return this._imageWidth;
		}

		public get imageHeight(): number {
			return this._imageHeight;
		}

		public get textureName(): string {
			return this._imageFile;
		}

		public get isLoaded(): boolean {
			return this._assetLoaded;
		}

		public load(): void {
			// get the asset
			let asset = AssetManager.getAsset(this._fontFileName);

			// if asset isn't loaded
			if (asset !== undefined) {
				this.processFontFile(asset.data);
			} else {
				Message.subscribe(MESSAGE_ASSET_LOADER_ASSET_LOADED + this._fontFileName, this);
			}
		}

		public onMessage(message: Message): void {
			if (message.code === MESSAGE_ASSET_LOADER_ASSET_LOADED + this._fontFileName) {
				this.processFontFile((message.context as TextAsset).data);
			}
		}

		public getGlyph(char: string): FontGlyph {

			// Replace Unknown Characters with '?'
			let code = char.charCodeAt(0);
			code = this._glyphs[code] === undefined ? 63 : code;
			return this._glyphs[code];
		}

		/**
		 * Returns a size that is representative of the dimensions of the text
		 * accounts for new lines
		 */
		public measureText(text: string): Vector2 {
			let size: Vector2 = Vector2.zero;

			let maxX = 0;
			let x = 0;
			let y = 0;

			for (let c of text) {
				switch (c) {
					case "\n":
						if (x > maxX) {
							maxX = x;
						}
						x = 0;
						y += this._size;
						break;
					default:
						// grab the xAdvance value
						x += this.getGlyph(String(x)).xAdvance;
						break;
				}
			}

			size.set(x, y);
			return size;
		}

		/**
		 * Lengthy process of file line by line
		 * Lines have a type
		 */
		private processFontFile(content: string): void {
			let charCount: number = 0;

			let lines: string[] = content.split("\n");
			for (let line of lines) {

				// Sanitize the line
				// use regular expression to replace any space with a single space
				let data = line.replace(/\s\s+/g, ' ');
				let fields = data.split(" ");

				// look at the type of line
				switch (fields[0]) {
					case "info":
						this._size = Number(FontUtilities.extractFieldValue(fields[2]));
						break;
					case "common":
						this._imageWidth = Number(FontUtilities.extractFieldValue(fields[3]));
						this._imageHeight = Number(FontUtilities.extractFieldValue(fields[4]));
						break;
					case "page":
						// scope variable for clarity
						{
							let id: number = Number(FontUtilities.extractFieldValue(fields[1]));

							this._imageFile = FontUtilities.extractFieldValue(fields[2]);
							// strip quotes
							this._imageFile = this._imageFile.replace(/"/g, "");

							// prepend the path to the image name
							this._imageFile = ("assets/fonts/" + this._imageFile).trim();
						}
						break;
					case "chars":
						charCount = Number(FontUtilities.extractFieldValue(fields[1]));

						// increment the expected count, the file's count is off by one
						charCount++;
						break;
					case "char":
						{
							let glyph = FontGlyph.fromFields(fields);
							this._glyphs[glyph.id] = glyph;
						}
						break;
				}
			}

			// Verify the loaded glyphs
			let actualGlyphCount = 0;

			// only count properties
			// Object.keys returns all the properties of the passed in object
			let keys = Object.keys(this._glyphs);
			// make sure properties are not unwanted (inheritied, etc.)
			for (let key of keys) {
				if (this._glyphs.hasOwnProperty(key)) {
					actualGlyphCount++;
				}
			}

			if (actualGlyphCount === undefined) {
				throw new Error("Font file reported extistence of ${charCount} glyphs, but only ${actualGlyphcount} were found.");
			}

			this._assetLoaded = true;
		}
	}
}