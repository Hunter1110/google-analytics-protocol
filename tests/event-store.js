const eventStore = require('../src/event-store');
const db = require('../src/db');
const assert = require('assert');

describe("Event Store", function() {
    it("should store events successfully", () => {
        return eventStore.add({
            t: 'pageview',
            dh: 'localhost.com',
            dp: '/index.html'
        })
        .then(() => {
            return db.store('analyticsPings').all()
            .then((allRecords) => {
                assert.equal(allRecords.length, 1)
                assert.equal(allRecords[0].call.t, "pageview")
            })
        })
    })
    
    it("should retrieve events with correct timestamp data", () => {
        return eventStore.add({
            t: 'pageview',
            dh: 'localhost.com',
            dp: '/index.html'
        })
        .then(() => eventStore.getAllPendingCalls())
        .then((pendingEvents) => {
            assert.equal(pendingEvents.length, 1);
            
            // a little silly, but zero is a valid value, so test
            
            if (pendingEvents[0].call.qt !== 0) {
                assert.ok(pendingEvents[0].call.qt);
            }
            
        })
    })
    
    it("should delete events successfully", () => {
        return eventStore.add({
            t: 'pageview',
            dh: 'localhost.com',
            dp: '/index.html'
        })
        .then(() => eventStore.getAllPendingCalls())
        .then((pendingEvents) => {
            return eventStore.deleteEvents(pendingEvents);
        })
        .then(() => {
            return db.store("analyticsPings").all();  
        })
        .then((all) => {
            assert.equal(all.length, 0);
        })
        
    })
})