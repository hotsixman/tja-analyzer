import { Course as TjaCourse, BPMChangeCommand, ScrollCommand, MeasureCommand, NoteSequence } from "@hotsixman/tja";
import Note, { NoteOption } from "./Note";
import Group from "./Group";
import * as math from 'mathjs';

export default class Course {
    readonly difficulty: string
    readonly level: number;
    private notes: Note[] = [];
    private noRollNotes: Note[] = [];
    private groups: Group[] = [];


    getNotes(course: TjaCourse, bpm: number) {
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
        this.notes = noteOptions.map(option => {
            return new Note(option);
        })
        for (let i = this.notes.length - 1; i > 0; i--) {
            if (this.notes[i].type === 0) {
                this.notes[i - 1].delay = math.add(this.notes[i].delay, this.notes[i - 1].delay);
                this.notes[i - 1].fraction = math.add(this.notes[i-1].fraction, math.fraction(1, this.notes[i-1].fraction.d))
            }
        }
        this.notes = this.notes.filter(note => note.type !== 0);

        //연타구간도 결합
        this.noRollNotes = noteOptions.map(option => new Note(option));
        for (let i = this.noRollNotes.length - 1; i > 0; i--) {
            if (this.noRollNotes[i].type === 0 || this.noRollNotes[i].type === 5 || this.noRollNotes[i].type === 6 ||this.noRollNotes[i].type === 7 || this.noRollNotes[i].type === 8) {
                this.noRollNotes[i - 1].delay = math.add(this.noRollNotes[i].delay, this.noRollNotes[i - 1].delay);
                this.noRollNotes[i - 1].fraction = math.add(this.noRollNotes[i-1].fraction, math.fraction(1, this.noRollNotes[i-1].fraction.d))
            }
        }
        this.noRollNotes = this.noRollNotes.filter(note => note.type !== 0 && note.type !== 5 && note.type !== 6 && note.type !== 7 && note.type !== 8);
    }

    groupize(){
        let currentGroup:Group|undefined = undefined;
        this.noRollNotes.forEach((note) => {
            if(currentGroup === undefined){
                let {bpm, scroll, realScroll, measure, fraction, delay} = note;
                currentGroup = new Group({bpm, scroll, realScroll, measure, fraction, delay});
                this.groups.push(currentGroup);
            }
            
            if(['bpm', 'scroll', 'realScroll', 'measure', 'fraction', 'delay'].every((key) => math.compare(((currentGroup as Group)[key as keyof Group] as math.MathType), note[key as keyof Note]).valueOf() === 0)){//모두 일치
                currentGroup.notes.push(note);
            }
            else if(math.compare(currentGroup.realScroll, note.realScroll).valueOf() === 0 && math.compare(math.multiply(currentGroup.delay, 2), note.delay).valueOf() !== 1){//스크롤 같고 마지막 노트의 딜레이가 다른 노트의 딜레이의 2배이상일 때
                currentGroup.notes.push(note);
                currentGroup = undefined;
            }
            else{
                let {bpm, scroll, realScroll, measure, fraction, delay} = note;
                currentGroup = new Group({bpm, scroll, realScroll, measure, fraction, delay});
                this.groups.push(currentGroup);
                currentGroup.notes.push(note);
            }
        })
    }

    constructor(course: TjaCourse, bpm: number) {
        this.difficulty = course.difficulty.toString();
        this.level = course.stars;

        this.getNotes(course, bpm);
        this.groupize();
    }

    getDifficultyScore(){
        let complexity = this.groups.map(group => math.tanh(math.divide(group.getComplexity().valueOf(), 2500)));
        let densityDifficulty = this.groups.map(group => math.tanh(math.divide(group.getDensityDifficulty().valueOf() as number, 3000)));
        let length = this.groups.map(group => math.divide(math.erf(math.divide(group.notes.length, 50)), 20));
        let multiplied = complexity.map((e, i) => math.multiply(math.multiply(math.multiply(e, 20), math.multiply(densityDifficulty[i], 20)), length).valueOf() as number);
        let sum = math.sum(multiplied)
        return {
            difficulty: this.difficulty,
            sum,
            //score: math.round(math.multiply(math.tanh(math.divide(math.sqrt(math.sqrt(sum).valueOf() as number), 2.3).valueOf() as number), 100), 2)
            score: math.round(math.multiply(math.tanh(math.divide(math.sqrt(math.sqrt(sum).valueOf() as number ), 2).valueOf() as number), 100), 2)
            //multiplied,
        }
    }
}

interface MaybeNoteOption {
    bpm: math.Fraction;
    scroll: math.Fraction;
    type: number;
    measure: math.Fraction;
}