/**
 * EventBus.js
 * ----------------------------------
 * Sistem Publish/Subscribe untuk komunikasi antar modul yang ter-decouple.
 */

export class EventBus {
    constructor() {
        this.events = {};
    }

    subscribe(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    publish(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }

    unsubscribe(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
}
