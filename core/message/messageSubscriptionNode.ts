namespace TSE {

	// acts a container to hold these two values
	export class MessageSubscriptionNode {

		public message: Message;

		public handler: IMessageHandler;

		public constructor(message: Message, handler: IMessageHandler) {
			this.message = message;
			this.handler = handler;
		}
	}
}