namespace TSE {
	/**
	 * Message Bus is our Message Manager
	 * 
	 */
	export class MessageBus {

		// list of codes and IMessageHandlers that keeps track of our subscriptions
		private static _subscriptions: { [code: string]: IMessageHandler[] } = {};

		// for performance reasons, we want to limit the number of messages being sent
		private static _normalQueueMessagePerUpdate: number = 10;
		private static _normalMessageQueue: MessageSubscriptionNode[] = [];

		private constructor() {

		}

		// create a subscription for a particular handler
		public static addSubscription(code: string, handler: IMessageHandler): void {
			if (MessageBus._subscriptions[code] === undefined) {
				MessageBus._subscriptions[code] = [];
			}

			// check if the handler and code combination already exists
			if (MessageBus._subscriptions[code].indexOf(handler) !== -1) {
				console.warn("Attempting to add a duplicate handler to code: " + code + ". subscription not added.")
			} else {
				MessageBus._subscriptions[code].push(handler);
			}
		}

		public static removeSubscription(code: string, handler: IMessageHandler): void {
			// code and handler combination does not exist
			if (MessageBus._subscriptions[code] === undefined) {
				console.warn("Cannot unsubscribe handler from code: " + code + " because that code is not subscribed to.");
				return;
			}

			let nodeIndex = MessageBus._subscriptions[code].indexOf(handler);
			// if node as been found
			if (nodeIndex !== -1) {
				MessageBus._subscriptions[code].splice(nodeIndex, 1);
			}
		}

		/**
		 * 
		 */
		public static post(message: Message): void {
			//console.log("Message posted:", message);

			// check if we have any handlers for this code 'message'
			let handlers = MessageBus._subscriptions[message.code];

			if (handlers === undefined) {
				return;
			}

			for (let h of handlers) {
				if (message.priority === MessagePriority.HIGH) {
					h.onMessage(message);
				} else {
					// queue message to be sent out later
					MessageBus._normalMessageQueue.push(new MessageSubscriptionNode(message, h));
				}
			}
		}

		public static update(time: number): void {
			if (MessageBus._normalMessageQueue.length === 0) {
				return;
			}

			let messageLimit = Math.min(MessageBus._normalQueueMessagePerUpdate, MessageBus._normalMessageQueue.length);
			for (let i = 0; i < messageLimit; ++i) {
				let node = MessageBus._normalMessageQueue.pop();
				node.handler.onMessage(node.message);
			}
		}
	}
}