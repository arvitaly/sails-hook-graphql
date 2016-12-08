"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const child_process_1 = require("child_process");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => __awaiter(this, void 0, void 0, function* () {
    let id = 0;
    let commands = {};
    const child = child_process_1.fork(__dirname + "/sails-fork.js");
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
    return new Promise((resolve, reject) => {
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
});
