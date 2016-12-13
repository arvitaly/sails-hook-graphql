import { toGlobalId } from "graphql-relay";
import { createModel1, lift, model1Id, RemoteApp } from "sails-fixture-app";
import Client from "./../__fixtures__/SocketClient";

describe("functional tests", () => {
    let app: RemoteApp;
    let client: Client;
    beforeEach(async () => {
        app = await lift();
        client = new Client("http://127.0.0.1:14001");
    });
    afterEach(async () => {
        client.close();
        app.kill();
    });
    it("query one", async () => {
        const created = await app.create("modelname1", createModel1());
        const result = await client.query(`query Q1{
            viewer{
                modelName1(id:"${ toGlobalId("ModelName1", created.id)}"){
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
    });
    it("query one with subscribe", async (done) => {
        const created = await app.create(model1Id, createModel1());
        const result = await client.subscription(`query Q1{
            viewer{
                modelName1(id:"${toGlobalId("ModelName1", created.id)}"){
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
        await app.update(model1Id, created.id, { name: "test" });
    });
    it("query connection", async () => {
        await app.create(model1Id, createModel1());
        await app.create(model1Id, createModel1());
        const created = await app.create(model1Id, createModel1());
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
    });
    it("query connection with subscription", async (done) => {
        const created = await app.create(model1Id, createModel1());
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
                delete data.data.updatedAt;
                delete data.id;
                expect(data).toMatchSnapshot();
                done();
            });
        await app.update(model1Id, created.id, { name: "test" });
    });
    it("mutation create", async () => {
        const newName1 = "newName1";
        const num1 = 1122;
        const dt1 = "Wed, 10 Nov 2010 17:00:00 GMT";
        const result = await client.query(`mutation M1{            
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
                        id: toGlobalId("Model2", "key13"),
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
    });
    it("mutation update", async () => {
        const created = await app.create(model1Id, createModel1());
        const newName1 = "n1";
        const dt1 = "Sun, 10 Nov 2013 17:00:00 GMT";
        const globalId = toGlobalId("ModelName1", created.id);
        const result = await client.query(`mutation M1{            
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
                        id: toGlobalId("Model2", "key13"),
                        key: "key13",
                        name: "name12",
                    },
                },
            },
        });
    });
});
