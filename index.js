"use strict";
module.exports = (sails) => {
    return {
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
                    res.send({ data: "ok" });
                    //return this.controller.index(req, res);
                },
            };
        },
        controller: null,
        initialize: function (cb) {
            /*sails.on("hook:orm:loaded", () => {
                const schema = generate(sails);
                this.controller = Controller({ schema: schema });
                graphql(schema, introspectionQuery).then(jsonSchema => {
                    this.jsonSchema = jsonSchema;
                    cb();
                }).catch((err) => {
                    throw err;
                });
            });*/
            cb();
        },
        jsonSchema: null,
    };
};
