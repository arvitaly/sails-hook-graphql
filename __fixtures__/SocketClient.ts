import { ChildProcess, fork } from "child_process";
import { EventEmitter } from "events";
import SocketIO = require("socket.io-client");
export default class Client extends EventEmitter {
    protected child: ChildProcess;
    protected queries: { [index: string]: { resolve: any, reject: any, subscription: any } } = {};
    constructor(url: string) {
        super();
        this.child = fork("./__fixtures__/client", [url]);
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
    public subscription(q: string, cb) {
        return this.query(q, "subscription", cb);
    }
    public query(query: string, type = "query", cb = null) {
        const id = (+new Date()) + "" + parseInt("" + Math.random(), 0);
        this.queries[id] = { resolve: null, reject: null, subscription: cb };
        return new Promise((resolve, reject) => {
            this.queries[id].resolve = resolve;
            this.queries[id].reject = reject;
            this.child.send({ id, type, query });
        });
    }
    public close() {
        this.child.kill();
    }
}
