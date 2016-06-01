const eventStore = require('./event-store');
const sync = require('./sync');
const config = require('./config');

const promiseDelay = (delay) => {
    return new Promise((fulfill) => setTimeout(fulfill, delay));
}

module.exports = function(call) {
    
    if (!config.GA_ID) {
        throw new Error("Need to specify analytics ID with setAnalyticsID() before sending any calls.")
    }
    
    return eventStore.add(call)
    .then(() => {
        // Sometimes we run analytics calls in multiple succession
        // so let's add a small delay to encourage batching.
        return promiseDelay(100);
    })
    .then(() => {
        return sync();
    })
}

module.exports.setAnalyticsID = function(id) {
    config.GA_ID = id;
}