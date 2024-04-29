import { Course as TjaCourse, BPMChangeCommand, ScrollCommand, MeasureCommand, NoteSequence } from "@hotsixman/tja";
import Note, { NoteOption } from "./Note";
import Group from "./Group";
import * as math from 'mathjs';

export default class Course {
    readonly difficulty: string
    readonly level: number;
    readonly playTime: math.Fraction;
    readonly rollTime: {
        pure: math.Fraction;
        pureList: math.Fraction[];
        withBalloon: math.Fraction;
    }
    readonly minRealScroll: math.Fraction;
    readonly maxRealScroll: math.Fraction;
    readonly density: math.Fraction;
    readonly balloons: number[];
    readonly peak: math.Fraction;
    readonly notes: Note[] = [];
    readonly noRollNotes: Note[] = [];
    readonly groups: Group[] = [];

    static getRollTime(course: Course): { pure: math.Fraction; withBalloon: math.Fraction; pureList: math.Fraction[]; } {
        let pureRollTime = math.fraction(0);
        let pureRollTimeList: math.Fraction[] = [];
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
        })

        return {
            pure: pureRollTime,
            withBalloon: withBalloonRollTime,
            pureList: pureRollTimeList
        }
    }

    static getPlayTime(course: Course): math.Fraction {
        let playTime = math.fraction(0)

        course.notes.forEach((note, i, a) => {
            if (i === a.length - 1) {
                return;
            }
            playTime = math.add(playTime, note.delay)
        })

        return playTime
    }

    static getMinMaxRealScroll(course: Course): [math.Fraction, math.Fraction] {
        let min:math.Fraction|undefined;
        let max = math.fraction(0);

        course.notes.forEach(note => {
            if(min === undefined){
                min = math.fraction(note.realScroll)
            }
            if (math.compare(note.realScroll, min).valueOf() === -1) {
                min = math.fraction(note.realScroll)
            }
            if (math.compare(note.realScroll, max).valueOf() === 1) {
                max = math.fraction(note.realScroll)
            }
        })

        return [min as unknown as math.Fraction, max];
    }

    //TjaCourse notes -> tja-anaylyzer notes
    static getNotes(course: TjaCourse, bpm: number): [Note[], Note[]] {
        const { singleCourse } = course;
        let _bpm = math.fraction(bpm);
        let scroll = math.fraction(1);
        let measure = math.fraction(1);
        let noteOptions: NoteOption[] = [];
        let currentBar: MaybeNoteOption[] = [];
        singleCourse.getCommands().forEach(command => {
            if (command instanceof BPMChangeCommand) {
                _bpm = math.fraction(command.value);
            }
            else if (command instanceof ScrollCommand) {
                scroll = math.fraction(command.value);
            }
            else if (command instanceof MeasureCommand) {
                measure = math.fraction(command.value.numerator, command.value.denominator);
            }
            else if (command instanceof NoteSequence) {
                if(command.notes.length === 1){
                    noteOptions.push({
                        type: 0,
                        bpm: math.fraction(_bpm),
                        scroll: math.fraction(scroll),
                        measure: math.fraction(measure),
                        fraction: math.fraction(1)
                    })
                }

                command.notes.forEach(note => {
                    if (note.noteType === 'A' || note.noteType === 'B' || note.noteType === 'F') {
                        return;
                    }

                    if (note.noteType === ",") {
                        noteOptions.push(
                            ...currentBar.map(maybeNoteOption => {
                                return {
                                    ...maybeNoteOption,
                                    fraction: math.fraction(1, currentBar.length)
                                }
                            }
                            ));
                        currentBar = [];
                    }
                    else {
                        currentBar.push({
                            type: Number(note.noteType),
                            bpm: math.fraction(_bpm),
                            scroll: math.fraction(scroll),
                            measure: math.fraction(measure)
                        })
                    }
                })
            }
        })

        //비어있는 구간의 딜레이를 앞 노트의 딜레이에 결합
        let notes = noteOptions.map(option => {
            return new Note(option);
        })
        for (let i = notes.length - 1; i > 0; i--) {
            if (notes[i].type === 0) {
                notes[i - 1].delay = math.add(notes[i].delay, notes[i - 1].delay);
                notes[i - 1].fraction = math.add(notes[i - 1].fraction, notes[i].fraction);
            }
        }
        notes = notes.filter(note => note.type !== 0);

        //연타구간도 결합
        let noRollNotes = noteOptions.map(option => new Note(option));
        for (let i = noRollNotes.length - 1; i > 0; i--) {
            if (noRollNotes[i].type === 0 || noRollNotes[i].type === 5 || noRollNotes[i].type === 6 || noRollNotes[i].type === 7 || noRollNotes[i].type === 8) {
                noRollNotes[i - 1].delay = math.add(noRollNotes[i].delay, noRollNotes[i - 1].delay);
                noRollNotes[i - 1].fraction = math.add(noRollNotes[i - 1].fraction, noRollNotes[i].fraction)
            }
        }
        noRollNotes = noRollNotes.filter(note => note.type !== 0 && note.type !== 5 && note.type !== 6 && note.type !== 7 && note.type !== 8);

        return [notes, noRollNotes]
    }

    //groupize notes
    static groupize(thisCourse: Course): void {
        let currentGroup: Group | undefined = undefined;
        thisCourse.noRollNotes.forEach((note) => {
            if (currentGroup === undefined) {
                let { bpm, scroll, realScroll, measure, fraction, delay } = note;
                currentGroup = new Group({ bpm, scroll, realScroll, measure, fraction, delay });
                thisCourse.groups.push(currentGroup);
            }

            if (['bpm', 'scroll', 'realScroll', 'measure', 'fraction', 'delay'].every((key) => math.compare(((currentGroup as Group)[key as keyof Group] as math.MathType), note[key as keyof Note]).valueOf() === 0)) {//모두 일치
                currentGroup.notes.push(note);
            }
            else if (math.compare(currentGroup.realScroll, note.realScroll).valueOf() === 0 && math.compare(math.multiply(currentGroup.delay, 2), note.delay).valueOf() !== 1) {//스크롤 같고 마지막 노트의 딜레이가 다른 노트의 딜레이의 2배이상일 때
                currentGroup.notes.push(note);
                currentGroup = undefined;
            }
            else {
                let { bpm, scroll, realScroll, measure, fraction, delay } = note;
                currentGroup = new Group({ bpm, scroll, realScroll, measure, fraction, delay });
                thisCourse.groups.push(currentGroup);
                currentGroup.notes.push(note);
            }
        })
    }

    constructor(course: TjaCourse, bpm: number) {
        this.difficulty = course.difficulty.toString();
        this.level = course.stars;

        [this.notes, this.noRollNotes] = Course.getNotes(course, bpm);
        Course.groupize(this);

        [this.minRealScroll, this.maxRealScroll] = Course.getMinMaxRealScroll(this)

        this.playTime = Course.getPlayTime(this)
        this.balloons = [...course.singleCourse.balloonCounts];
        this.rollTime = Course.getRollTime(this);
        this.density = math.fraction(math.divide(this.noRollNotes.length, this.playTime) as number|math.Fraction);

        let peak:math.Fraction = math.fraction(0);
        this.noRollNotes.forEach((note, i, a) => {
            let notes = 0;
            let j = i;
            let delay = note.delay;
            while(true){
                j++;
                if(j >= a.length) break;
                delay = math.add(delay, a[j].delay);
                if(math.compare(delay, 2).valueOf() === 1){
                    break;
                }
                notes++;
            }
            if(math.compare(peak, math.fraction(notes, 2)).valueOf() === -1){
                peak = math.fraction(notes, 2);
            }
        })
        this.peak = peak;
    }
}

interface MaybeNoteOption {
    bpm: math.Fraction;
    scroll: math.Fraction;
    type: number;
    measure: math.Fraction;
}