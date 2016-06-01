const crypto = require('crypto');
const fetch = require('node-fetch');
const config = require('./src/config');


// Things we expect in the browser

global.crypto = crypto;
global.fetch = fetch;
global.indexedDB = require('fake-indexeddb');
global.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange')
// hacky hacky hack...
// global.window = global
// require('fake-indexeddb/exports')
// global.IDBKeyRange = 

config.GA_ID = "TEST_ID"

afterEach(() => {
    
    // clean up DB
    
    let db = require('./src/db');
    
    let deletePromises = [];
    
    for (let store in db.stores) {
        deletePromises.push(new Promise((fulfill, reject) => {
            db.store(store).clear(fulfill);
        }))
    }
    
    return Promise.all(deletePromises)

})
