import { ChildProcess, fork } from "child_process";
import { ExecutionResult } from "graphql";
import Sails = require("sails");
import SocketIO = require("socket.io-client");
import { createModel1, lift, lower } from "sails-fixture-app";
describe("functional tests", () => {
    let app: Sails.App;
    let client: Client;
    beforeEach(async () => {
        app = await lift({ path: __dirname + "/../__fixtures__/app1", port: 14001 });
        client = new Client("http://127.0.0.1:14001");
    });
    it("query one", async () => {
        const created = await createModel1(app);
        console.log("created", created);
        //let created = { id: 1 };
        const result = await client.query(`query Q1{
            viewer{
                modelName1(id:${created.id}){
                    title
                }
            }
        }`);
        expect(result).toEqual({ viewer: { modelName1: { title: created.title } } });
    });
    afterEach(async () => {
        client.close();
        await lower(app);
    });
});

class Client {
    protected child: ChildProcess;
    protected resolve;
    protected reject;
    constructor(url: string) {
        this.child = fork("./__fixtures__/client", [url]);
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
    public close() {
        this.child.kill();
    }
}
