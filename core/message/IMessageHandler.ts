namespace TSE {
	/**
	 * message handler can subscribe and listen for a message
	 */
	export interface IMessageHandler {

		onMessage(message: Message): void;
	}
}