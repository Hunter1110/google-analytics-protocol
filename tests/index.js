const analytics = require('../src/index');
const nock = require('nock');

describe("Main function call", function() {
    it("should add call and sync", () => {
        
        let nockInstance = nock("https://www.google-analytics.com")
            .post("/collect")
            .reply(200)
        
        return analytics({
            t: 'pageview',
            dh: 'localhost.com',
            dp: '/index.html'
        })
        .then(() => {
            nockInstance.done();
        })
    })    
})