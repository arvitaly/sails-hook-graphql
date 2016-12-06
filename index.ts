// tslint:disable:only-arrow-functions object-literal-shorthand
import { IConfig } from "./config";
import Sails = require("sails");
import { graphql, introspectionQuery } from "graphql";
import { Callbacks, Controller, getGraphQLSchema } from "sails-graphql-adapter";
export = (sails: Sails.App) => {
    return {
        callbacks: null,
        configKey: "graphql",
        configure: function () {
            const config: IConfig = sails.config[this.configKey] || {};
            let url: string = config.url || "/graphql";
            config.isJSONSchema = typeof (config.isJSONSchema) === "undefined" ? true : config.isJSONSchema;
            if (config.isJSONSchema === true) {
                config.jsonSchemaURL = config.jsonSchemaURL || "/graphql.schema.json";
                sails.config.routes[config.jsonSchemaURL] = {
                    fn: (req, res) => {
                        res.send(this.jsonSchema);
                    },
                };
            }
            sails.config.routes["POST " + url] = {
                fn: (req, res) => {
                    return this.controller.index(req, res);
                },
            };

        },
        controller: null,
        initialize: function (cb) {
            this.callbacks = new Callbacks(sails);
            sails.on("hook:orm:loaded", () => {
                const schema = getGraphQLSchema(sails, this.callbacks);
                this.controller = Controller({ schema: schema });
                /*graphql(schema, introspectionQuery).then((jsonSchema) => {
                    this.jsonSchema = jsonSchema;
                    cb();
                }).catch((err) => {
                    throw err;
                });*/
            });
            cb();
        },
        jsonSchema: null,
    };
};
