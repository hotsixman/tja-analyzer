import { Bar, HitNote } from "tja-parser";
import { getFirstHitNote, getLastHitNote } from "../../util";
import * as math from 'mathjs';

/**
 * @returns averageDensity(note/s)
 */
export default function getAverageDensity(bars: Bar[]) {
    const firstNote = getFirstHitNote(bars);
    const lastNote = getLastHitNote(bars);

    if(!firstNote || !lastNote) return null;

    const time = math.subtract(lastNote.getTiming(), firstNote.getTiming());
    const noteCount = getHitNoteCount(bars);

    return math.divide(noteCount, time).valueOf() as number * 1000;
}

function getHitNoteCount(bars: Bar[]){
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