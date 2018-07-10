const EventStore = require('./event-store');
const querystring = require('query-string');
const PromiseMap = require('promise-map');

const splitIntoGroupsOfTwenty = function (arr) {
    let batches = [];
    while (arr.length > 0) {
        batches.push(arr.splice(0,20));
    }
}

let hasBackgroundSyncSupport = typeof(self) !== 'undefined' && self.registration && self.registration.sync;
const syncTag = 'analytics_sync';

if (hasBackgroundSyncSupport) {
    self.addEventListener('sync', (event) => {
        if (event.tag !== syncTag) {
            return;
        }
        console.info("Running analytics sync task...")
        event.waitUntil(sync());
    })
}

const sendBatchRequest = function (batch) {
    
    if (batch.length === 0) {
        return Promise.resolve(true);
    }
    
    // Different endpoints for single requests and batched ones
    // not really clear why we'd use collect rather than just
    // always use batch, but let's follow the spec
    
    let urlToSendTo = "https://www.google-analytics.com/";
    
    if (batch.length === 1) {
        urlToSendTo += "collect";
    } else {
        urlToSendTo += "batch";
    }
    
    let body = batch.map((b) => querystring.stringify(b.call)).join('\n');

    
    return fetch(urlToSendTo, {
        method: "POST",
        body: body
    })
    .then((res) => {
        return res.status === 200;  
    }).catch(() => {
        return false;
    });
}

let syncCurrentlyRunning = false;

const sync = function() {
    
    if (syncCurrentlyRunning === true) {
        // we only want to be running this once at a time,
        // otherwise we might end up sending events twice
        return Promise.resolve();
    }
    console.info("Running analytics sync...")
    syncCurrentlyRunning = true;
    
    return EventStore.getAllPendingCalls()
    .then((allCalls) => {
        
        if (allCalls.length === 0) {
            return false;
        }
        
        // The batch call endpoint only allows a maximum of 20 calls,
        // so we'll only send 20 at a time.
        
        let first20 = allCalls.slice(0, 20);
        
        return sendBatchRequest(first20)
        .then((wasSuccessful) => {
            if (wasSuccessful === false) {
                return false;
            }
            
            return EventStore.deleteEvents(first20)
            .then(() => {
                return true;
            })
        })
        
       
        
    })
    .then((runAgain) => {
        syncCurrentlyRunning = false;
        if (runAgain) {
            return sync();
        }
    })
    .catch((err) => {

        // Was trying to use service worker sync, but it fails when
        // it doesn't have a window context:

        // "You can only register for a sync event when the user has a window open to the site."
        // https://developers.google.com/web/updates/2015/12/background-sync?hl=en

        // if sync failed, register to retry next time.
        //console.warn("Requesting sync task to send analytics");
        //self.registration.sync.register(syncTag);
    })
}

module.exports = sync;