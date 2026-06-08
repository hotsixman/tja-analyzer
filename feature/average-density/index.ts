import { Bar, Course, HitNote } from "tja-parser";
import { getFirstNote, getLastNote, getSpecificBranch } from "../../util";
import * as math from 'mathjs';

/**
 * @returns averageDensity(note/s)
 */
export function getAverageDensity(course: Course) {
    const bars = getSpecificBranch(course, 'master');
    const firstNote = getFirstNote(bars);
    const lastNote = getLastNote(bars);

    if(!firstNote || !lastNote) return null;

    const time = math.subtract(lastNote.getTiming(), firstNote.getTiming());
    const noteCount = getNoteCount(bars);

    return math.divide(noteCount, time).valueOf() as number * 1000;
}

function getNoteCount(bars: Bar[]){
    let count = 0;
    for (const bar of bars) {
        for (const note of bar.getNotes()) {
            if (note instanceof HitNote) {
                count++;
            }
        }
    }
    return count;
}