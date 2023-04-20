namespace TSE {

	// enums define a set of named constants
	export enum MessagePriority {
		NORMAL,
		HIGH
	}

	export class Message {

		// what the messages subscribe to
		public code: string;

		public context: any; // free-form data

		// any class can send a message
		public sender: any;

		public priority: MessagePriority;

		// default MessagePriority is NORMAL
		public constructor(code: string, sender: any, context?: any, priority: MessagePriority = MessagePriority.NORMAL) {
			this.code = code;
			this.sender = sender;
			this.context = context;
			this.priority = priority;
		}

		// send a normal priorty message
		public static send(code: string, sender: any, context?: any): void {
			MessageBus.post(new Message(code, sender, context, MessagePriority.NORMAL));
		}

		// send a high priority message
		public static sendPriority(code: string, sender: any, context?: any): void {
			MessageBus.post(new Message(code, sender, context, MessagePriority.HIGH));
		}

		public static subscribe(code: string, handler: IMessageHandler): void {
			MessageBus.addSubscription(code, handler);
		}

		public static unsubscribe(code: string, handler: IMessageHandler): void {
			MessageBus.removeSubscription(code, handler);
		}
	}
}