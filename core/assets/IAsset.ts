/**
 * interfaces are details that are shared between all assets
 * i in IAsset denotes this asset as an interface
 * - similar too properties of a car (all cars have a steering wheel, etc.)
 */
namespace TSE {

	export interface IAsset {

		// we will not be modifying these properties
		readonly name: string;

		readonly data: any; // open type and can be set to anything
	}
}