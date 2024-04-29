"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tja_1 = require("@hotsixman/tja");
const Course_1 = __importDefault(require("./Course"));
class Fumen {
    constructor(tja) {
        this.courses = [];
        this.song = tja_1.TJAParser.parse(tja);
        this.song.courses.forEach(course => {
            this.courses.push(new Course_1.default(course, this.song.bpm));
        });
    }
}
exports.default = Fumen;
