type EventListener<T = string> = (...args: T[]) => void;

class Listener {
    private events: { [key: string]: EventListener<any>[] } = {};

    on<T>(event: T, listener: EventListener<T>): void {
        if (!this.events[event as string]) {
            this.events[event as string] = [];
        }
        this.events[event as any].push(listener);
    }

    off<T>(event: T, listener: EventListener<T>): void {
        if (!this.events[event as string]) return;
        this.events[event as string] = this.events[event as any].filter(l => l !== listener);
    }

    emit<T>(event: T, ...args: T[]): void {
        if (!this.events[event as string]) return;
        this.events[event as string].forEach(listener => listener(...args));
    }
}

const eventEmitter = new Listener();


export default eventEmitter;