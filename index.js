"use strict";
const sails_graphql_adapter_1 = require("sails-graphql-adapter");
module.exports = (sails) => {
    return {
        callbacks: null,
        configKey: "graphql",
        configure: function () {
            const config = sails.config[this.configKey] || {};
            let url = config.url || "/graphql";
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
            this.callbacks = new sails_graphql_adapter_1.Callbacks(sails);
            sails.on("hook:orm:loaded", () => {
                const schema = sails_graphql_adapter_1.getGraphQLSchema(sails, this.callbacks);
                this.controller = sails_graphql_adapter_1.Controller({ schema: schema });
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
