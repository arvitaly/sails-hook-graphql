import { ChildProcess, fork } from "child_process";
import { GraphQLResult } from "graphql/graphql";
import Sails = require("sails");
import SocketIO = require("socket.io-client");
import { createModel1, lift, lower } from "sails-fixture-app";
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000000;
describe("functional tests", () => {
    let app: Sails.App;
    let client: Client;
    beforeEach(async () => {
        app = await lift({ path: __dirname + "/../__fixtures__/app1", port: 14001 });
        client = new Client("http://127.0.0.1:14001");
    });
    afterEach(async () => {
        await lower(app);
    })
    it("query one", async () => {
        const created = await createModel1(app);
        console.log("created", created);
        const result = await client.query(`query Q1{
            model1(id:${created.id}){
                title
            }
        }`);
        expect(result).toEqual({ title: created.title });
    });
});

class Client {
    protected child: ChildProcess;
    protected resolve;
    protected reject;
    constructor(url: string) {
        this.child = fork("./client", [url]);
        this.child.on("message", (data) => {
            switch (data.type) {
                case "reject":
                    this.reject(data.data);
                default:
                    this.resolve(data.data);
            }
        });
    }
    public query(q: string) {
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
            this.child.send(q);
        });
    }
}
