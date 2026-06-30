import { Bar } from "tja-parser";
import { getHitNotes } from "../../util/hitnote";
import * as math from 'mathjs';

export default function getSegmentalDensity(bars: Bar[], segments: number = 10){
    const hitNotes = getHitNotes(bars);
    const hitNoteRange = math.subtract(hitNotes[hitNotes.length - 1].getTiming(), hitNotes[0].getTiming());
    const startNote = hitNotes[0];
    const interval = math.divide(hitNoteRange, segments) as math.Fraction;

    const segmentNoteCounts: number[] = new Array(segments).fill(null).map(() => 0);
    hitNotes.forEach((note) => {
        const index = Math.min(segments - 1, Math.floor(math.divide(math.subtract(note.getTiming(), startNote.getTiming()), interval).valueOf() as number));
        segmentNoteCounts[index]++;
    });

    return segmentNoteCounts.map((e) => math.divide(e, interval).valueOf() as number * 1000);
}