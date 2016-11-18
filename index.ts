import { IConfig } from "./config";
import { controller as Controller, generate } from "sails-graphql-adapter";
export = (sails: Sails.App) => {
    return {
        // tslint:disable:only-arrow-functions object-literal-shorthand
        configKey: "graphql",
        configure: function () {
            const config: IConfig = sails.config[this.configKey];
            let url: string = config && config.url ? config.url : "/graphql";
            sails.config.routes[url] = (req, res, next) => {
                return this.controller.index(req, res, next);
            };
        },
        controller: null,
        initialize: function (cb) {
            sails.on("hook:orm:loaded", () => {
                this.controller = Controller({ schema: generate(sails) });
                cb();
            });
        },
    };
};
