"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const child_process_1 = require("child_process");
const graphql_relay_1 = require("graphql-relay");
const events_1 = require("events");
const sails_fixture_app_1 = require("sails-fixture-app");
describe("functional tests", () => {
    let app;
    let client;
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        app = yield sails_fixture_app_1.lift({ path: __dirname + "/../__fixtures__/app1", port: 14001 });
        client = new Client("http://127.0.0.1:14001");
    }));
    it("query one", () => __awaiter(this, void 0, void 0, function* () {
        const created = yield sails_fixture_app_1.createModel1(app);
        const result = yield client.query(`query Q1{
            viewer{
                modelName1(id:"${graphql_relay_1.toGlobalId("ModelName1", created.id)}"){
                    name
                }
            }
        }`);
        expect(result).toEqual({ viewer: { modelName1: { name: created.name } } });
    }));
    it("query one with subscribe", (done) => __awaiter(this, void 0, void 0, function* () {
        const created = yield sails_fixture_app_1.createModel1(app);
        const result = yield client.subscription(`query Q1{
            viewer{
                modelName1(id:"${graphql_relay_1.toGlobalId("ModelName1", created.id)}"){
                    name
                }
            }
        }`, (data) => {
            delete data.data.updatedAt;
            expect(data).toMatchSnapshot();
            done();
        });
        expect(result).toEqual({ viewer: { modelName1: { name: created.name } } });
        yield app.models[sails_fixture_app_1.model1Id].update({ id: created.id }, { name: "test" });
    }));
    it("query connection", () => __awaiter(this, void 0, void 0, function* () {
        yield sails_fixture_app_1.createModel1(app);
        yield sails_fixture_app_1.createModel1(app);
        const created = yield sails_fixture_app_1.createModel1(app);
        const result = yield client.query(`query Q1{
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
        yield app.models[sails_fixture_app_1.model1Id].update({ id: created.id }, { name: "test" });
    }));
    it("query connection with subscription", (done) => __awaiter(this, void 0, void 0, function* () {
        const created = yield sails_fixture_app_1.createModel1(app);
        const result = yield client.subscription(`query Q1{
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
            delete data.data.updatedAt;
            expect(data).toMatchSnapshot();
            done();
        });
        yield app.models[sails_fixture_app_1.model1Id].update({ id: created.id }, { name: "test" });
    }));
    afterEach(() => __awaiter(this, void 0, void 0, function* () {
        client.close();
        yield sails_fixture_app_1.lower(app);
    }));
});
class Client extends events_1.EventEmitter {
    constructor(url) {
        super();
        this.queries = {};
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
                default:
            }
        });
    }
    subscription(q, cb) {
        return this.query(q, "subscription", cb);
    }
    query(query, type = "query", cb = null) {
        const id = (+new Date()) + "" + parseInt("" + Math.random(), 0);
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
