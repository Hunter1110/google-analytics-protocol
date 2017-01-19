const db = require('./db');
const config = require('./config');
const getGuid = require('./get-guid');
const PromiseMap = require('promise-map');
const detectDevice = require('./detect-device');

module.exports = {
    add(call) {
        
        if (!config.GA_ID) {
            throw new Error("No analytics ID provided. Cannot log call.")
        }
        
        return getGuid()
        .then((guid) => {
            // default values we don't need to provide with every call
        
            let completeCall = Object.assign({}, call, {
                v: 1,
                tid: config.GA_ID,
                cid: guid
            });

            // For storing custom dimension stuff
            for (var prop in completeCall) {
                if (completeCall.hasOwnProperty(prop)) {
                    var callVal = completeCall[prop];

                    if (typeof callVal === 'string') {
                        completeCall[prop] = callVal.replace('{{clientId}}', guid);
                    }
                }
            }
            
            return db.store("analyticsPings").put({
                call: completeCall,
                timestamp: Date.now()
            })
        })

    },
    
    getAllPendingCalls() {
        return db.store("analyticsPings").all()
        .then((allRecords) => {
            
                
            return allRecords.map((record) => {
                
                // qt time specifies the offset of when the event occurred:
                // https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters#qt
           
                record.call.qt = Date.now() - record.timestamp
                
                return {
                    call: record.call,
                    id: record.id
                }

            })    
            
        })
    },
    
    deleteEvents(events) {
        let ids = events.map((e) => e.id);
        
        return Promise.resolve(ids)
        .then(PromiseMap((id) => {
            return db.store("analyticsPings").del(id);
        }))
    }
}