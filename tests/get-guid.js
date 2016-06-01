const getGuid = require('../src/get-guid');
const assert = require('assert');

describe("Get GUID", () => {
    it("should generate a GUID", () => {
        return getGuid()
        .then((guid) => {
            assert.notEqual(guid, null);
        })
    })
    
    it("should return the same GUID on multiple calls", () => {
        return getGuid()
        .then((firstGuid) => {
            return getGuid()
            .then((secondGuid) => {
                assert.equal(firstGuid, secondGuid);
            });
        })
    })
})