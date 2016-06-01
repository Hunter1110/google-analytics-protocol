const eventStore = require('../src/event-store');
const sync = require('../src/sync');
const nock = require('nock');
const assert = require('assert');
const querystring = require('query-string');
describe("Sync", function() {
    
    afterEach(() => {
        nock.cleanAll();
    })
    
    it("should send a single event", () => {
        
        let nockInstance = nock("https://www.google-analytics.com")
            .post("/collect", (body) => {
                return querystring.parse(body).t === "pageview"
            })
            .reply(200)
        
        return eventStore.add({
            t: 'pageview',
            dh: 'localhost.com',
            dp: '/index.html'
        })
        .then(() => {
            return sync()
        })
        .then(() => {
            nockInstance.done()
            return eventStore.getAllPendingCalls()
        })
        .then((allPending) => {
            assert.equal(allPending.length, 0)
        })
    })
    
    it("should not delete events when sync fails", () => {
        
        let nockInstance = nock("https://www.google-analytics.com")
            .post("/collect")
            .reply(500)
        
        return eventStore.add({
            t: 'pageview',
            dh: 'localhost.com',
            dp: '/index.html'
        })
        .then(() => {
            return sync()
        })
        .then(() => {
            nockInstance.done()
            return eventStore.getAllPendingCalls()
        })
        .then((allPending) => {
            assert.equal(allPending.length, 1)
        })
    })
    
    it("should batch multiple events", () => {
        let nockInstance = nock("https://www.google-analytics.com")
            .post("/batch")
            .reply(200)
            
        let addPromises = [0,1].map((i) => {
            return eventStore.add({
                t: 'pageview',
                dh: 'localhost.com',
                dp: `/index${i}.html`
            })
        })
            
        return Promise.all(addPromises)
        .then((resp) => {
            return sync()
        })
        .then(() => {
            nockInstance.done()
            return eventStore.getAllPendingCalls()
        })
        .then((allPending) => {
            assert.equal(allPending.length, 0)
        })
    })
    
    it("should run multiple times for > 20 calls", () => {
         let nockInstance = nock("https://www.google-analytics.com")
            .post("/batch")
            .times(2)
            .reply(200)
            
        let addPromises = [];
        
        for (let x = 0; x < 30; x++) {
            addPromises.push(eventStore.add({
                t: 'pageview',
                dh: 'localhost.com',
                dp: `/index${x}.html`
            }));
        }

            
        return Promise.all(addPromises)
        .then((resp) => {
            return sync()
        })
        .then(() => {
            nockInstance.done()
            return eventStore.getAllPendingCalls()
        })
        .then((allPending) => {
            assert.equal(allPending.length, 0)
        })
    
    })
})