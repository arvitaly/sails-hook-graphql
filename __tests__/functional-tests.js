"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_relay_1 = require("graphql-relay");
const sails_fixture_app_1 = require("sails-fixture-app");
const SocketClient_1 = require("./../__fixtures__/SocketClient");
describe("functional tests", () => {
    let app;
    let client;
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        app = yield sails_fixture_app_1.lift({
            modules: {
                "sails-hook-graphql": require.resolve("./../"),
            },
        });
        client = new SocketClient_1.default("http://127.0.0.1:14001");
    }));
    afterEach(() => __awaiter(this, void 0, void 0, function* () {
        client.close();
        app.kill();
        yield new Promise((resolve) => { setTimeout(resolve, 500); });
    }));
    it("query one", () => __awaiter(this, void 0, void 0, function* () {
        const created = yield app.create("modelname1", sails_fixture_app_1.createModel1());
        const result = yield client.query(`query Q1{
            viewer{
                modelName1(id:"${graphql_relay_1.toGlobalId("ModelName1", created.id)}"){
                    name
                    model2Field{
                        id
                        key
                        name
                    }
                }
            }
        }`);
        expect(result).toEqual({ viewer: { modelName1: { name: created.name, model2Field: null } } });
    }));
    it("query one with subscribe", (done) => __awaiter(this, void 0, void 0, function* () {
        const created = yield app.create(sails_fixture_app_1.model1Id, sails_fixture_app_1.createModel1());
        const result = yield client.subscription(`query Q1{
            viewer{
                modelName1(id:"${graphql_relay_1.toGlobalId("ModelName1", created.id)}"){
                    name
                }
            }
        }`, (data) => {
            delete data.data.updatedAt;
            delete data.id;
            expect(data).toMatchSnapshot();
            done();
        });
        expect(result).toEqual({ viewer: { modelName1: { name: created.name } } });
        yield app.update(sails_fixture_app_1.model1Id, created.id, { name: "test" });
    }));
    it("query connection", () => __awaiter(this, void 0, void 0, function* () {
        yield app.create(sails_fixture_app_1.model1Id, sails_fixture_app_1.createModel1());
        yield app.create(sails_fixture_app_1.model1Id, sails_fixture_app_1.createModel1());
        const created = yield app.create(sails_fixture_app_1.model1Id, sails_fixture_app_1.createModel1());
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
    }));
    it("query connection with subscription", (done) => __awaiter(this, void 0, void 0, function* () {
        const created = yield app.create(sails_fixture_app_1.model1Id, sails_fixture_app_1.createModel1());
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
            delete data.id;
            expect(data).toMatchSnapshot();
            done();
        });
        yield app.update(sails_fixture_app_1.model1Id, created.id, { name: "test" });
    }));
    it("mutation create", () => __awaiter(this, void 0, void 0, function* () {
        const newName1 = "newName1";
        const num1 = 1122;
        const dt1 = "Wed, 10 Nov 2010 17:00:00 GMT";
        const result = yield client.query(`mutation M1{            
            createModelName1(input:{
                name:"${newName1}", 
                num:${num1}, 
                isActive:false,
                firstActive:"${dt1}",
                createModel2Field:{
                    name: "name12",
                    key: "key13"
                }
                createModel3s:[{
                    title: "model3Name1"
                },{
                    title: "model3Name2"
                }]
            }){
                modelName1{
                    name
                    num
                    isActive
                    firstActive
                    model2Field{
                        id
                        key
                        name
                    }       
                    model3s{
                        edges{
                            node{                                
                                title
                            }
                        }
                    }             
                }                
            }            
        }`);
        expect(result).toEqual({
            createModelName1: {
                modelName1: {
                    name: newName1,
                    num: num1,
                    isActive: false,
                    firstActive: dt1,
                    model2Field: {
                        id: graphql_relay_1.toGlobalId("Model2", "key13"),
                        key: "key13",
                        name: "name12",
                    },
                    model3s: {
                        edges: [{
                                node: {
                                    title: "model3Name1",
                                },
                            }, {
                                node: {
                                    title: "model3Name2",
                                },
                            }],
                    },
                },
            },
        });
    }));
    it("mutation update", () => __awaiter(this, void 0, void 0, function* () {
        const created = yield app.create(sails_fixture_app_1.model1Id, sails_fixture_app_1.createModel1());
        const newName1 = "n1";
        const dt1 = "Sun, 10 Nov 2013 17:00:00 GMT";
        const globalId = graphql_relay_1.toGlobalId("ModelName1", created.id);
        const result = yield client.query(`mutation M1{            
            updateModelName1(input:{
                id: "${globalId}",
                setName:{name:"${newName1}"}, 
                setFirstActive:{firstActive:"${dt1}"},
                createModel2Field:{
                    name: "name12",
                    key: "key13"
                }
            }){
                modelName1{
                    id
                    name
                    firstActive
                    model2Field{
                        id
                        key
                        name
                    }                    
                }                
            }            
        }`);
        expect(result).toEqual({
            updateModelName1: {
                modelName1: {
                    id: globalId,
                    name: newName1,
                    firstActive: dt1,
                    model2Field: {
                        id: graphql_relay_1.toGlobalId("Model2", "key13"),
                        key: "key13",
                        name: "name12",
                    },
                },
            },
        });
    }));
});
