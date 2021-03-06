// tslint:disable:only-arrow-functions object-literal-shorthand
import { IConfig } from "./config";
import Sails = require("sails");
import { graphql, introspectionQuery } from "graphql";
import getGraphQLSchemaAndResolver, { Callbacks, Controller } from "sails-graphql-adapter";
export = (sails: Sails.App) => {
    return {
        callbacks: null,
        configKey: "graphql",
        configure: function() {
            const config: IConfig = sails.config[this.configKey] || {};
            const url: string = config.url || "/graphql";
            config.isJSONSchema = typeof (config.isJSONSchema) === "undefined" ? true : config.isJSONSchema;
            if (config.isJSONSchema === true) {
                config.jsonSchemaURL = config.jsonSchemaURL || "/graphql.schema.json";
                sails.config.routes[config.jsonSchemaURL] = {
                    fn: (req, res) => {
                        res.send(this.jsonSchema);
                    },
                };
            }
            sails.config.routes[url + "-unsubscribe"] = {
                fn: (req, res) => {
                    return this.controller.unsubscribe(req, res);
                },
            };
            sails.config.routes[url] = {
                fn: (req, res) => {
                    return this.controller.index(req, res);
                },
            };

        },
        controller: null,
        initialize: function(cb) {
            this.callbacks = new Callbacks(sails);
            sails.on("hook:orm:loaded", () => {
                const info = getGraphQLSchemaAndResolver(sails, this.callbacks);
                this.controller = Controller({ schema: info.schema, resolver: info.resolver });
                graphql(info.schema, introspectionQuery).then((jsonSchema) => {
                    this.jsonSchema = jsonSchema;
                    cb();
                }).catch((err) => {
                    throw err;
                });
            });
        },
        jsonSchema: null,
    };
};
