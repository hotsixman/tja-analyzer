"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Group {
    constructor(option) {
        this.notes = []; //Types of Notes in Group Should Be 1|2|3|4
        this.bpm = option.bpm;
        this.scroll = option.scroll;
        this.realScroll = option.realScroll;
        this.measure = option.measure;
        this.fraction = option.fraction;
        this.delay = option.delay;
    }
}
exports.default = Group;
