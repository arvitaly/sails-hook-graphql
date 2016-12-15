"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const http_1 = require("http");
const sails_fixture_app_1 = require("sails-fixture-app");
describe("Schema JSON", () => {
    let app;
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        app = yield sails_fixture_app_1.lift({
            modules: {
                "sails-hook-graphql": require.resolve("./../"),
            },
        });
    }));
    afterEach(() => __awaiter(this, void 0, void 0, function* () {
        app.kill();
    }));
    it("generate", (done) => {
        http_1.get({
            hostname: "localhost",
            port: 14001,
            path: "/graphql.schema.json",
        }, (res) => {
            let body = "";
            res.on("data", (chunk) => {
                body += chunk;
            });
            res.on("end", () => {
                expect(body).toMatchSnapshot();
                done();
            });
        });
    });
});
