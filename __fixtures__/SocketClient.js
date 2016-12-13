"use strict";
const child_process_1 = require("child_process");
const events_1 = require("events");
class Client extends events_1.EventEmitter {
    constructor(url) {
        super();
        this.queries = {};
        this.id = 0;
        this.child = child_process_1.fork("./__fixtures__/client", [url]);
        this.child.on("message", (data) => {
            switch (data.type) {
                case "reject":
                    this.queries[data.id].reject(data.data);
                    break;
                case "resolve":
                    this.queries[data.id].resolve(data.data);
                    break;
                case "subscription":
                    this.queries[data.id].subscription(data.data);
                    break;
                case "log":
                    console.warn(data.data);
                default:
            }
        });
    }
    subscription(q, cb) {
        return this.query(q, "subscription", cb);
    }
    query(query, type = "query", cb = null) {
        const id = this.id++;
        this.queries[id] = { resolve: null, reject: null, subscription: cb };
        return new Promise((resolve, reject) => {
            this.queries[id].resolve = resolve;
            this.queries[id].reject = reject;
            this.child.send({ id, type, query });
        });
    }
    close() {
        this.child.kill();
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Client;
