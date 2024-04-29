"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Group {
    constructor(option) {
        this.notes = []; //Types of Notes in Group Should Be 1|2|3|4
        this.colorChanges = 0;
        this.sizeChanges = 0;
        this.bpm = option.bpm;
        this.scroll = option.scroll;
        this.realScroll = option.realScroll;
        this.measure = option.measure;
        this.fraction = option.fraction;
        this.delay = option.delay;
        this.notes.forEach((n, i, a) => {
            if (i + 1 == a.length)
                return;
            if ((n.type < 3) !== (a[i + 1].type < 3)) {
                this.sizeChanges++;
            }
            if ((n.type % 2) !== (a[i + 1].type % 2)) {
                this.colorChanges++;
            }
        });
    }
}
exports.default = Group;
