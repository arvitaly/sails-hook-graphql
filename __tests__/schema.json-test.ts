import { get } from "http";
import { createModel1, lift, model1Id, RemoteApp } from "sails-fixture-app";
describe("Schema JSON", () => {
    let app: RemoteApp;
    beforeEach(async () => {
        app = await lift({
            modules: {
                "sails-hook-graphql": require.resolve("./../"),
            },
        });
    });
    afterEach(async () => {
        app.kill();
    });
    it("generate", (done) => {
        get({
            hostname: "localhost",
            port: 14001,
            path: "/graphql.schema.json",
        }, (res) => {
            let body = "";
            res.on("data", (chunk: any) => {
                body += chunk;
            });
            res.on("end", () => {
                expect(body).toMatchSnapshot();
                done();
            });
        });
    });
});
