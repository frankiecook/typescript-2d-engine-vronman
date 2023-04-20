namespace TSE {

	export interface IComponent {

		name: string;

		//owner(): SimObject;

		setOwner(owner: SimObject): void;

		load(): void;

		update(time: number): void;

		render(shader: Shader): void;
	}
}