const db = require('./db');
const createGuid = require('./create-guid');

/*
 * It seems more than a little silly to create an object store
 * where we'll only ever store one value, but without access to
 * localStorage or cookies we can't do much else.
 */

const GUID_KEY = "analytics-guid";

module.exports = function() {

    return db.store("clientGuid").get(GUID_KEY)
    .then((existingObject) => {
        if (existingObject) {
            // If we already have one, return that
            return existingObject.guid;
        }
        
        // Otherwise, make a new one
        let newGuid = createGuid();
        
        // Store it in the DB
        return db.store("clientGuid").put(GUID_KEY, {guid:newGuid})
        .then(() => {
            // Then make sure we're returning this guid, not the
            // db call result
            return newGuid;
        })
    })
}
