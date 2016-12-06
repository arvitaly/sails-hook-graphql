import { ExecutionResult } from "graphql";
import SailsIOJS = require("sails.io.js");
import SocketIO = require("socket.io-client");
const io = SailsIOJS(SocketIO);
io.sails.url = process.argv[2];
type Message = {
    type: "update" | "add" | "remove";
    modelId;
    data: any;
};
process.on("message", async (message) => {
    let subscriptionId = null;
    switch (message.type) {
        case "subscription":
            subscriptionId = (+new Date()) + "" + parseInt("" + Math.random(), 0);
            io.socket.on("subscription-" + subscriptionId, (m: Message) => {
                process.send({
                    data: m,
                    id: message.id,
                    type: "subscription",
                });
            });
        default:
            try {
                process.send({
                    data: await query(message.query, subscriptionId),
                    id: message.id,
                    type: "resolve",
                });
            } catch (e) {
                process.send({
                    data: e,
                    id: message.id,
                    type: "reject",
                });
            }
    }
});

function query(query, subscriptionId) {
    return new Promise((resolve, reject) => {
        io.socket.post("/graphql", { query, subscriptionId }, (data: ExecutionResult, jwres) => {
            if (jwres.statusCode !== 200) {
                reject("Invalis status: " + jwres.statusCode + ", body: " + JSON.stringify(jwres));
                return;
            }
            if (data.errors) {
                reject("GraphQL errors: " + JSON.stringify(data.errors));
                return;
            }
            resolve(JSON.parse(data as any).data);
        });
    });
}
