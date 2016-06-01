const Treo = require('treo');

let toPromisify = ['get', 'put', 'all', 'count', 'del'];

toPromisify.forEach((method) => {
    let origFunc = Treo.Store.prototype[method];
    
    Treo.Store.prototype[method] = function() {

        return new Promise((fulfill, reject) => {
            
            let args = Array.from(arguments);
            args.push((err, data) => {
                if (err) {
                    reject(err);
                } else {
                    fulfill(data);
                }
            })
            origFunc.apply(this, args)
        })
    }
})

const schema = Treo.schema()
    .version(1)
        .addStore("analyticsPings", { key: "id", increment: true })
        .addStore("clientGuid", {key: "name"});

        
const db = Treo("google-analytics-protocol", schema)

module.exports = db;