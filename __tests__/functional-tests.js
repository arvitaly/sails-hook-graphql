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
const sails_fixture_app_1 = require("sails-fixture-app");
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000000;
describe("functional tests", () => {
    let app;
    let client;
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        app = yield sails_fixture_app_1.lift({ path: __dirname + "/../__fixtures__/app1", port: 14001 });
        client = new Client("http://127.0.0.1:14001");
    }));
    afterEach(() => __awaiter(this, void 0, void 0, function* () {
        yield sails_fixture_app_1.lower(app);
    }));
    it("query one", () => __awaiter(this, void 0, void 0, function* () {
        const created = yield sails_fixture_app_1.createModel1(app);
        console.log("created", created);
        const result = yield client.query(`query Q1{
            model1(id:${created.id}){
                title
            }
        }`);
        expect(result).toEqual({ title: created.title });
    }));
});
class Client {
    constructor(url) {
        this.child = child_process_1.fork("./client", [url]);
        this.child.on("message", (data) => {
            switch (data.type) {
                case "reject":
                    this.reject(data.data);
                default:
                    this.resolve(data.data);
            }
        });
    }
    query(q) {
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
            this.child.send(q);
        });
    }
}
