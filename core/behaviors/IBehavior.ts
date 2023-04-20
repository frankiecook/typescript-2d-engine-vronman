namespace TSE {

	export interface IBehavior {
		name: string;

		setOwner(owner: SimObject): void;

		update(time: number): void;

		/* Behavior should be applied to the attached object 
		* any data can be passed in and the behavior should know how to handle
		*/
		apply(userData: any): void;
	}
}