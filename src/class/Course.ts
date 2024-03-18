import { Course as TjaCourse, BPMChangeCommand, ScrollCommand, MeasureCommand, NoteSequence } from "@hotsixman/tja";
import Note, { NoteOption } from "./Note";
import * as math from 'mathjs';

export default class Course {
    readonly difficulty: string
    readonly level: number;
    private _notes: Note[];

    constructor(course: TjaCourse, bpm: number) {
        this.difficulty = course.difficulty.toString();
        this.level = course.stars;

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

        this._notes = noteOptions.map(option => {
            return new Note(option);
        })
        /*
        for(let i = this._notes.length - 1; i > 0; i--){
            if(this._notes[i].type === 0){
                this._notes[i-1].delay = math.add(this._notes[i].delay, this._notes[i-1].delay);
            }
        }

        this._notes = this._notes.filter(note => note.type !== 0);
        */
    }
}

interface MaybeNoteOption {
    bpm: math.Fraction;
    scroll: math.Fraction;
    type: number;
    measure: math.Fraction;
}