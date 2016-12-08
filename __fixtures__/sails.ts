import { fork } from "child_process";
export type RemoteApp = {
    kill(): void;
    command(type: string, data: any): Promise<any>;
};
export default async (): Promise<RemoteApp> => {
    let id = 0;
    let commands = {};
    const child = fork(__dirname + "/sails-fork.js");
    child.on("message", (data) => {
        switch (data.type) {
            case "reject":
                commands[data.id].reject(data.data);
                break;
            case "resolve":
                commands[data.id].resolve(data.data);
                break;
            case "log":
                console.warn(data.data);
            default:

        }
    });
    return new Promise<RemoteApp>((resolve, reject) => {
        commands[id] = {
            resolve,
            reject,
        };
    }).then(() => {
        return {
            kill: () => {
                child.kill();
            },
            command: (type, data) => {
                id++;
                child.send({
                    id,
                    type,
                    data,
                });
                return new Promise((resolve, reject) => {
                    commands[id] = {
                        resolve,
                        reject,
                    };
                });
            },
        };
    });
};
