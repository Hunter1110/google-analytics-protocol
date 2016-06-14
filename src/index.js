const eventStore = require('./event-store');
const sync = require('./sync');
const config = require('./config');

const promiseDelay = (delay) => {
    return new Promise((fulfill) => setTimeout(fulfill, delay));
}

let warnedAboutNoID = false;

module.exports = function(call, returnSyncPromise = false) {
    
    if (!config.GA_ID) {
        if (warnedAboutNoID === false) {
            console.warn("Need to specify analytics ID with setAnalyticsID() before sending any calls. Will not send any in this session.");
            warnedAboutNoID = true;
        }
        console.info("Analytics call:", call);
        return Promise.resolve();
    }
    
    return eventStore.add(call)
    .then(() => {
        // Sometimes we run analytics calls in multiple succession
        // so let's add a small delay to encourage batching.
        return promiseDelay(100);
    })
    .then(() => {
        
        let syncPromise = sync();
        if (returnSyncPromise) {
            // mostly just for testing
            return syncPromise;
        } else {
            // We are NOT returning sync because we don't want any existing
            // promise chain to wait for it to complete.
        }
    })
}

module.exports.setAnalyticsID = function(id) {
    config.GA_ID = id;
}