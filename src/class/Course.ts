import { Course as TjaCourse, BPMChangeCommand, ScrollCommand, MeasureCommand, NoteSequence } from "@hotsixman/tja";
import Note, { NoteOption } from "./Note";
import Group from "./Group";
import * as math from 'mathjs';

export default class Course {
    readonly difficulty: string
    readonly level: number;
    private notes: Note[] = [];
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
    }

    groupize(){
        let currentGroup:Group|undefined = undefined;
        this.notes.filter(note => note.type < 5).forEach((note) => {
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
}

interface MaybeNoteOption {
    bpm: math.Fraction;
    scroll: math.Fraction;
    type: number;
    measure: math.Fraction;
}