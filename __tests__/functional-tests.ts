import { toGlobalId } from "graphql-relay";
import { createModel1 } from "sails-fixture-app";
import createSailsApp, { RemoteApp } from "./../__fixtures__/sails";
import Client from "./../__fixtures__/SocketClient";

describe("functional tests", () => {
    let app: RemoteApp;
    let client: Client;
    beforeEach(async () => {
        app = await createSailsApp();
        client = new Client("http://127.0.0.1:14001");
    });
    afterEach(async () => {
        client.close();
        app.kill();
    });
    fit("query one", async () => {
        const created = await app.command("create", { modelId: "modelname1", created: createModel1() });
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
    fit("query one with subscribe", async (done) => {
        const created = await app.command("create", { modelId: "modelname1", created: createModel1() });
        const result = await client.subscription(`query Q1{
            viewer{
                modelName1(id:"${toGlobalId("ModelName1", created.id)}"){
                    name
                }
            }
        }`, (data) => {
                delete data.data.updatedAt;
                expect(data).toMatchSnapshot();
                done();
            });
        expect(result).toEqual({ viewer: { modelName1: { name: created.name } } });
        await app.command("update", { modelId: "modelname1", where: { id: created.id }, updated: { name: "test" } });
    });
    fit("query connection", async () => {
        await app.command("create", { modelId: "modelname1", created: createModel1() });
        await app.command("create", { modelId: "modelname1", created: createModel1() });
        const created = await app.command("create", { modelId: "modelname1", created: createModel1() });
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
    fit("query connection with subscription", async (done) => {
        const created = await app.command("create", { modelId: "modelname1", created: createModel1() });
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
                expect(data).toMatchSnapshot();
                done();
            });
        await app.command("update", { modelId: "modelname1", where: { id: created.id }, updated: { name: "test" } });
    });
    fit("mutation create", async () => {
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
    fit("mutation update", async () => {
        const created = await app.command("create", { modelId: "modelname1", created: createModel1() });
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
