import { ExecutionResult } from "graphql";
import SailsIOJS = require("sails.io.js");
import SocketIO = require("socket.io-client");
const io = SailsIOJS(SocketIO);
io.sails.url = process.argv[2];
process.on("message", (q) => {
    io.socket.post("/graphql", { query: q }, (data: ExecutionResult, jwres) => {
        if (jwres.statusCode !== 200) {
            process.send({
                data: "Invalis status: " + jwres.statusCode + ", body: " + JSON.stringify(jwres),
                type: "reject",
            });
            return;
        }
        if (data.errors) {
            process.send({
                data: "GraphQL errors: " + JSON.stringify(data.errors),
                type: "reject",
            });
            return;
        }
        process.send({
            data: JSON.parse(data as any).data,
            type: "resolve",
        });
    });
});
