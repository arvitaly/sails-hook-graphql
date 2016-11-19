"use strict";
const graphql_1 = require("graphql");
const sails_graphql_adapter_1 = require("sails-graphql-adapter");
module.exports = (sails) => {
    return {
        // tslint:disable:only-arrow-functions object-literal-shorthand
        configKey: "graphql",
        configure: function () {
            const config = sails.config[this.configKey] || {};
            let url = config.url || "/graphql";
            config.isJSONSchema = typeof (config.isJSONSchema) === "undefined" ? true : config.isJSONSchema;
            if (config.isJSONSchema === true) {
                config.jsonSchemaURL = config.jsonSchemaURL || "/graphql.schema.json";
                sails.config.routes[config.jsonSchemaURL] = (req, res, next) => {
                    res.send(this.jsonSchema);
                };
            }
            sails.config.routes[url] = (req, res, next) => {
                return this.controller.index(req, res, next);
            };
        },
        controller: null,
        initialize: function (cb) {
            sails.on("hook:orm:loaded", () => {
                const schema = sails_graphql_adapter_1.generate(sails);
                this.controller = sails_graphql_adapter_1.controller({ schema: schema });
                graphql_1.graphql(schema, graphql_1.introspectionQuery).then(jsonSchema => {
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
