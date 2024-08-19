import session, { Store } from 'express-session';

export type SessionData = session.SessionData & {
	lastAccessed?: number;
};

class InMemoryStore extends Store {
	private store: { [sid: string]: SessionData } = {};

	constructor() {
		super();
	}

	get(sid: string, cb: (err: any, session?: SessionData) => void): void {
		process.nextTick(() => cb(null, this.store[sid]));
	}

	set(sid: string, session: SessionData, cb: (err?: any) => void): void {
		this.store[sid] = session;
		process.nextTick(() => cb());
	}

	destroy(sid: string, cb: (err?: any) => void): void {
		delete this.store[sid];
		process.nextTick(() => cb());
	}

	length(cb: (err: any, length?: number) => void): void {
		process.nextTick(() => cb(null, Object.keys(this.store).length));
	}

	clear(cb: (err?: any) => void): void {
		this.store = {};
		process.nextTick(() => cb());
	}

	getAllSessionIds(): string[] {
		return Object.keys(this.store);
	}

	getSession(sid: string): SessionData | undefined {
		return this.store[sid];
	}
}

// Create an instance of the in-memory store
const inMemoryStore = new InMemoryStore();

export default inMemoryStore;
