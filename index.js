"use strict";
const graphql_1 = require("graphql");
const sails_graphql_adapter_1 = require("sails-graphql-adapter");
module.exports = (sails) => {
    return {
        callbacks: null,
        configKey: "graphql",
        configure: function () {
            const config = sails.config[this.configKey] || {};
            const url = config.url || "/graphql";
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
        initialize: function (cb) {
            this.callbacks = new sails_graphql_adapter_1.Callbacks(sails);
            sails.on("hook:orm:loaded", () => {
                const info = sails_graphql_adapter_1.default(sails, this.callbacks);
                this.controller = sails_graphql_adapter_1.Controller({ schema: info.schema, resolver: info.resolver });
                graphql_1.graphql(info.schema, graphql_1.introspectionQuery).then((jsonSchema) => {
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
