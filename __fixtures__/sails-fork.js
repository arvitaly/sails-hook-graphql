"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const sails_fixture_app_1 = require("sails-fixture-app");
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = yield sails_fixture_app_1.lift({ path: __dirname + "/app1", port: 14001 });
        process.on("message", (message) => __awaiter(this, void 0, void 0, function* () {
            switch (message.type) {
                case "create":
                    try {
                        const created = yield app.models[message.data.modelId].create(message.data.created);
                        process.send({
                            id: message.id,
                            type: "resolve",
                            data: created,
                        });
                    }
                    catch (e) {
                        process.send({
                            id: message.id,
                            type: "reject",
                            data: JSON.stringify(e.toString()),
                        });
                    }
                    break;
                case "update":
                    try {
                        const updated = yield app.models[message.data.modelId].update(message.data.where, message.data.updated);
                        process.send({
                            id: message.id,
                            type: "resolve",
                            data: updated,
                        });
                    }
                    catch (e) {
                        process.send({
                            id: message.id,
                            type: "reject",
                            data: e,
                        });
                    }
                    break;
                default:
            }
        }));
    });
}
start().then(() => {
    process.send({
        id: 0,
        type: "resolve",
        data: null,
    });
}).catch((e) => {
    process.send({
        id: 0,
        type: "resolve",
        data: e,
    });
});
