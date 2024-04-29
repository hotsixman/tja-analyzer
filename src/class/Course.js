"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tja_1 = require("@hotsixman/tja");
const Note_1 = __importDefault(require("./Note"));
const Group_1 = __importDefault(require("./Group"));
const math = __importStar(require("mathjs"));
class Course {
    static getRollTime(course) {
        let pureRollTime = math.fraction(0);
        let pureRollTimeList = [];
        let withBalloonRollTime = math.fraction(0);
        let balloonIndex = 0;
        course.notes.forEach(note => {
            if (note.type === 5 || note.type === 6) {
                pureRollTimeList.push(note.delay);
                pureRollTime = math.add(pureRollTime, note.delay);
                withBalloonRollTime = math.add(withBalloonRollTime, note.delay);
            }
            else if (note.type === 7) {
                if (course.balloons[balloonIndex] >= 300) {
                    withBalloonRollTime = math.add(withBalloonRollTime, note.delay);
                }
                balloonIndex++;
            }
        });
        return {
            pure: pureRollTime,
            withBalloon: withBalloonRollTime,
            pureList: pureRollTimeList
        };
    }
    static getPlayTime(course) {
        let playTime = math.fraction(0);
        course.notes.forEach((note, i, a) => {
            if (i === a.length - 1) {
                return;
            }
            playTime = math.add(playTime, note.delay);
        });
        return playTime;
    }
    static getMinMaxRealScroll(course) {
        let min;
        let max = math.fraction(0);
        course.notes.forEach(note => {
            if (min === undefined) {
                min = math.fraction(note.realScroll);
            }
            if (math.compare(note.realScroll, min).valueOf() === -1) {
                min = math.fraction(note.realScroll);
            }
            if (math.compare(note.realScroll, max).valueOf() === 1) {
                max = math.fraction(note.realScroll);
            }
        });
        return [min, max];
    }
    //TjaCourse notes -> tja-anaylyzer notes
    static getNotes(course, bpm) {
        const { singleCourse } = course;
        let _bpm = math.fraction(bpm);
        let scroll = math.fraction(1);
        let measure = math.fraction(1);
        let noteOptions = [];
        let currentBar = [];
        singleCourse.getCommands().forEach(command => {
            if (command instanceof tja_1.BPMChangeCommand) {
                _bpm = math.fraction(command.value);
            }
            else if (command instanceof tja_1.ScrollCommand) {
                scroll = math.fraction(command.value);
            }
            else if (command instanceof tja_1.MeasureCommand) {
                measure = math.fraction(command.value.numerator, command.value.denominator);
            }
            else if (command instanceof tja_1.NoteSequence) {
                if (command.notes.length === 1) {
                    noteOptions.push({
                        type: 0,
                        bpm: math.fraction(_bpm),
                        scroll: math.fraction(scroll),
                        measure: math.fraction(measure),
                        fraction: math.fraction(1)
                    });
                }
                command.notes.forEach(note => {
                    if (note.noteType === 'A' || note.noteType === 'B' || note.noteType === 'F') {
                        return;
                    }
                    if (note.noteType === ",") {
                        noteOptions.push(...currentBar.map(maybeNoteOption => {
                            return Object.assign(Object.assign({}, maybeNoteOption), { fraction: math.fraction(1, currentBar.length) });
                        }));
                        currentBar = [];
                    }
                    else {
                        currentBar.push({
                            type: Number(note.noteType),
                            bpm: math.fraction(_bpm),
                            scroll: math.fraction(scroll),
                            measure: math.fraction(measure)
                        });
                    }
                });
            }
        });
        //비어있는 구간의 딜레이를 앞 노트의 딜레이에 결합
        let notes = noteOptions.map(option => {
            return new Note_1.default(option);
        });
        for (let i = notes.length - 1; i > 0; i--) {
            if (notes[i].type === 0) {
                notes[i - 1].delay = math.add(notes[i].delay, notes[i - 1].delay);
                notes[i - 1].fraction = math.add(notes[i - 1].fraction, notes[i].fraction);
            }
        }
        notes = notes.filter(note => note.type !== 0);
        //연타구간도 결합
        let noRollNotes = noteOptions.map(option => new Note_1.default(option));
        for (let i = noRollNotes.length - 1; i > 0; i--) {
            if (noRollNotes[i].type === 0 || noRollNotes[i].type === 5 || noRollNotes[i].type === 6 || noRollNotes[i].type === 7 || noRollNotes[i].type === 8) {
                noRollNotes[i - 1].delay = math.add(noRollNotes[i].delay, noRollNotes[i - 1].delay);
                noRollNotes[i - 1].fraction = math.add(noRollNotes[i - 1].fraction, noRollNotes[i].fraction);
            }
        }
        noRollNotes = noRollNotes.filter(note => note.type !== 0 && note.type !== 5 && note.type !== 6 && note.type !== 7 && note.type !== 8);
        return [notes, noRollNotes];
    }
    //groupize notes
    static groupize(thisCourse) {
        let currentGroup = undefined;
        thisCourse.noRollNotes.forEach((note) => {
            if (currentGroup === undefined) {
                let { bpm, scroll, realScroll, measure, fraction, delay } = note;
                currentGroup = new Group_1.default({ bpm, scroll, realScroll, measure, fraction, delay });
                thisCourse.groups.push(currentGroup);
            }
            if (['bpm', 'scroll', 'realScroll', 'measure', 'fraction', 'delay'].every((key) => math.compare(currentGroup[key], note[key]).valueOf() === 0)) { //모두 일치
                currentGroup.notes.push(note);
            }
            else if (math.compare(currentGroup.realScroll, note.realScroll).valueOf() === 0 && math.compare(math.multiply(currentGroup.delay, 2), note.delay).valueOf() !== 1) { //스크롤 같고 마지막 노트의 딜레이가 다른 노트의 딜레이의 2배이상일 때
                currentGroup.notes.push(note);
                currentGroup = undefined;
            }
            else {
                let { bpm, scroll, realScroll, measure, fraction, delay } = note;
                currentGroup = new Group_1.default({ bpm, scroll, realScroll, measure, fraction, delay });
                thisCourse.groups.push(currentGroup);
                currentGroup.notes.push(note);
            }
        });
    }
    constructor(course, bpm) {
        this.notes = [];
        this.noRollNotes = [];
        this.groups = [];
        this.difficulty = course.difficulty.toString();
        this.level = course.stars;
        [this.notes, this.noRollNotes] = Course.getNotes(course, bpm);
        Course.groupize(this);
        [this.minRealScroll, this.maxRealScroll] = Course.getMinMaxRealScroll(this);
        this.playTime = Course.getPlayTime(this);
        this.balloons = [...course.singleCourse.balloonCounts];
        this.rollTime = Course.getRollTime(this);
        this.density = math.fraction(math.divide(this.noRollNotes.length, this.playTime));
        let peak = math.fraction(0);
        this.noRollNotes.forEach((note, i, a) => {
            let notes = 0;
            let j = i;
            let delay = note.delay;
            while (true) {
                j++;
                if (j >= a.length)
                    break;
                delay = math.add(delay, a[j].delay);
                if (math.compare(delay, 2).valueOf() === 1) {
                    break;
                }
                notes++;
            }
            if (math.compare(peak, math.fraction(notes, 2)).valueOf() === -1) {
                peak = math.fraction(notes, 2);
            }
        });
        this.peak = peak;
    }
}
exports.default = Course;
