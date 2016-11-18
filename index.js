"use strict";
const sails_graphql_adapter_1 = require("sails-graphql-adapter");
module.exports = (sails) => {
    return {
        // tslint:disable:only-arrow-functions object-literal-shorthand
        configKey: "graphql",
        configure: function () {
            const config = sails.config[this.configKey];
            let url = config && config.url ? config.url : "/graphql";
            sails.config.routes[url] = (req, res, next) => {
                return this.controller.index(req, res, next);
            };
        },
        controller: null,
        initialize: function (cb) {
            sails.on("hook:orm:loaded", () => {
                this.controller = sails_graphql_adapter_1.controller(sails_graphql_adapter_1.generate(sails));
                cb();
            });
        },
    };
};
