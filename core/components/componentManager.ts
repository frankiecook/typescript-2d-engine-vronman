namespace TSE {

	export class ComponentManager {

		private static _registeredBuilders: { [type: string]: IComponentBuilder } = {};

		public static registerBuilder(builder: IComponentBuilder): void {
			ComponentManager._registeredBuilders[builder.type] = builder;
		}

		/**
		 * looks at the componenet managers regeristerd builders
		 */
		public static extractComponent(json: any): IComponent {
			if (json.type != undefined) {
				if (ComponentManager._registeredBuilders[String(json.type)] !== undefined) {
					return ComponentManager._registeredBuilders[String(json.type)].buildFromJson(json);
				}

				throw new Error("COMponent mamanger error - type is missing or buildwer is not registered for this type.")
			}
		}
	}
}