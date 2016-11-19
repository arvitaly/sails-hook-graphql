import { IConfig } from "./config";
import { graphql, introspectionQuery } from "graphql";
import { controller as Controller, generate } from "sails-graphql-adapter";
export = (sails: Sails.App) => {
    return {
        // tslint:disable:only-arrow-functions object-literal-shorthand
        configKey: "graphql",
        configure: function () {
            const config: IConfig = sails.config[this.configKey] || {};
            let url: string = config.url || "/graphql";
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
                const schema = generate(sails);
                this.controller = Controller({ schema: schema });
                graphql(schema, introspectionQuery).then(jsonSchema => {
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
