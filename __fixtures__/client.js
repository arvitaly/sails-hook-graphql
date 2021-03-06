"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const SailsIOJS = require("sails.io.js");
const SocketIO = require("socket.io-client");
const io = SailsIOJS(SocketIO);
io.sails.url = process.argv[2];
process.on("message", (message) => __awaiter(this, void 0, void 0, function* () {
    let subscriptionId = null;
    switch (message.type) {
        case "subscription":
            subscriptionId = (+new Date()) + "" + parseInt("" + Math.random(), 0);
            io.socket.on("live", (m) => {
                process.send({
                    data: m,
                    id: message.id,
                    type: "subscription",
                });
            });
        default:
            try {
                process.send({
                    data: yield query(message.query, subscriptionId),
                    id: message.id,
                    type: "resolve",
                });
            }
            catch (e) {
                process.send({
                    data: e,
                    id: message.id,
                    type: "reject",
                });
            }
    }
}));
function query(query, subscriptionId) {
    return new Promise((resolve, reject) => {
        io.socket.post("/graphql", { query, subscriptionId }, (data, jwres) => {
            if (jwres.statusCode !== 200) {
                reject("Invalis status: " + jwres.statusCode + ", body: " + JSON.stringify("" + jwres.body) +
                    ", error " + +JSON.stringify("" + jwres.error));
                return;
            }
            const realData = JSON.parse(data);
            if (realData.errors) {
                reject("GraphQL errors: " + JSON.stringify(realData.errors));
                return;
            }
            resolve(realData.data);
        });
    });
}
