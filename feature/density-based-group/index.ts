import { Bar, HitNote } from "tja-parser";
import { getHitNotes } from "../../util/hitnote";
import { math } from '../../util';

export function getGroupByDensity(bars: Bar[]) {
    const groups: HitNote[][] = [];
    const hitNotes = getHitNotes(bars);

    let currentGroup: HitNote[];
    let prevNote: HitNote;

    hitNotes.forEach((note, i) => {
        if (!currentGroup) {
            currentGroup = [];
            groups.push(currentGroup);
        }

        if(
            i !== hitNotes.length - 1 &&
            prevNote &&
            math.compare(prevNote.getDelay(), note.getDelay()).valueOf() !== 0 //&&
            //math.compare(math.multiply(prevNote.getBPM(), prevNote.getDelay()), math.multiply(note.getBPM(), note.getDelay())) === 0
        ) {
            currentGroup = [];
            groups.push(currentGroup);
        }

        currentGroup.push(note);
        prevNote = note;
    });

    return groups;
}