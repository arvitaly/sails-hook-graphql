import { ChildProcess, fork } from "child_process";
import { ExecutionResult } from "graphql";
import { toGlobalId } from "graphql-relay";
import Sails = require("sails");
import { EventEmitter } from "events";
import SocketIO = require("socket.io-client");
import { createModel1, lift, lower, model1Id } from "sails-fixture-app";
describe("functional tests", () => {
    let app: Sails.App;
    let client: Client;
    beforeEach(async () => {
        app = await lift({ path: __dirname + "/../__fixtures__/app1", port: 14001 });
        client = new Client("http://127.0.0.1:14001");
    });
    it("query one", async () => {
        const created = await createModel1(app);
        const result = await client.query(`query Q1{
            viewer{
                modelName1(id:"${ toGlobalId("ModelName1", created.id)}"){
                    name
                }
            }
        }`);
        expect(result).toEqual({ viewer: { modelName1: { name: created.name } } });
    });
    it("query one with subscribe", async (done) => {
        const created = await createModel1(app);
        const result = await client.subscription(`query Q1{
            viewer{
                modelName1(id:"${toGlobalId("ModelName1", created.id)}"){
                    name
                }
            }
        }`, (data) => {
                expect(data).toMatchSnapshot();
                done();
            });
        expect(result).toEqual({ viewer: { modelName1: { name: created.name } } });
        await app.models[model1Id].update({ id: created.id }, { name: "test" });
    });
    it("query connection", async () => {
        await createModel1(app);
        await createModel1(app);
        const created = await createModel1(app);
        const result = await client.query(`query Q1{
            viewer{
                modelName1s{
                    edges{
                        node{
                            name
                        }
                    }
                    
                }
            }
        }`);
        expect(result).toMatchSnapshot();
        await app.models[model1Id].update({ id: created.id }, { name: "test" });
    });
    it("query connection with subscription", async (done) => {
        const created = await createModel1(app);
        const result = await client.subscription(`query Q1{
            viewer{
                modelName1s(where:{nameContains:"test"}){
                    edges{
                        node{
                            name
                        }
                    }
                    
                }
            }
        }`, (data) => {
                expect(data).toMatchSnapshot();
                done();
            });
        await app.models[model1Id].update({ id: created.id }, { name: "test" });
    });
    afterEach(async () => {
        client.close();
        await lower(app);
    });
});

class Client extends EventEmitter {
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
