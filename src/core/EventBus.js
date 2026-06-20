/**
 * EventBus.js
 * ----------------------------------
 * Sistem Publish/Subscribe untuk komunikasi antar modul yang ter-decouple.
 */

// TODO: Implement Event Bus

export class EventBus {
    constructor() {
        this.events = {};
    }

    subscribe(event, callback) {
        // TODO: Add callback to event
    }

    publish(event, data) {
        // TODO: Trigger callbacks
    }
}
