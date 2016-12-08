import { lift, lower } from "sails-fixture-app";
async function start() {
    const app = await lift({ path: __dirname + "/app1", port: 14001 });
    process.on("message", async (message) => {
        switch (message.type) {
            case "create":
                try {
                    const created = await app.models[message.data.modelId].create(message.data.created);
                    process.send({
                        id: message.id,
                        type: "resolve",
                        data: created,
                    });
                } catch (e) {
                    process.send({
                        id: message.id,
                        type: "reject",
                        data: JSON.stringify(e.toString()),
                    });
                }
                break;
            case "update":
                try {
                    const updated = await app.models[message.data.modelId].update(
                        message.data.where, message.data.updated);
                    process.send({
                        id: message.id,
                        type: "resolve",
                        data: updated,
                    });
                } catch (e) {
                    process.send({
                        id: message.id,
                        type: "reject",
                        data: e,
                    });
                }
                break;
            default:
        }
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
