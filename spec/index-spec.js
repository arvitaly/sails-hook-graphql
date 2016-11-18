"use strict";
const mock = require("mock2");
describe("Hook spec", () => {
    let controllerSpy;
    let generateSpy;
    let Hook;
    beforeEach(() => {
        controllerSpy = jasmine.createSpy("");
        generateSpy = jasmine.createSpy("");
        Hook = mock.require("./..", {
            "sails-graphql-adapter": {
                controller: controllerSpy,
                generate: generateSpy,
            },
        });
    });
    it("when initialize, should generate schema and create controller", () => {
        const schema = "schema1" + Math.random();
        const controllerHandler = "handler" + Math.random();
        const sailsOn = jasmine.createSpy("");
        const sails = { on: sailsOn };
        const cb = jasmine.createSpy("");
        const hook = Hook(sails);
        sailsOn.and.callFake((event, cb2) => {
            if (event === "hook:orm:loaded") {
                cb2();
            }
        });
        generateSpy.and.callFake((sails2) => {
            if (sails2 === sails) {
                return schema;
            }
        });
        controllerSpy.and.callFake((schema2) => {
            if (schema2 === schema) {
                return controllerHandler;
            }
        });
        hook.initialize(cb);
        expect(hook.controller).toBe(controllerHandler);
    });
    it("when configure and url setted in config, should create route with it", () => {
        const sails = {
            config: {
                graphql: {
                    url: "url1" + Math.random(),
                },
                routes: {},
            },
        };
        const hook = Hook(sails);
        hook.controller = { index: jasmine.createSpy("") };
        hook.configure();
        expect(sails.config.routes[sails.config.graphql.url]).toEqual(jasmine.any(Function));
        const req = "req1" + Math.random();
        const res = "res1" + Math.random();
        sails.config.routes[sails.config.graphql.url](req, res);
        expect(hook.controller.index.calls.allArgs()).toEqual([[req, res, undefined]]);
    });
    it("when configure and url not setted in config, should create route with /graphql", () => {
        const sails = {
            config: {
                routes: {},
            },
        };
        const hook = Hook(sails);
        hook.controller = { index: jasmine.createSpy("") };
        hook.configure();
        expect(sails.config.routes["/graphql"]).toEqual(jasmine.any(Function));
        const req = "req1" + Math.random();
        const res = "res1" + Math.random();
        sails.config.routes["/graphql"](req, res);
        expect(hook.controller.index.calls.allArgs()).toEqual([[req, res, undefined]]);
    });
});
