import { Bar } from "tja-parser";
import { getHitNotes } from '../../util/hitnote';
import * as math from 'mathjs';

export default function getSlidingWindowDensity(bars: Bar[]): number[] {
    const slidingWindowDensity: number[] = [];

    const hitnotes = getHitNotes(bars);
    const lastNote = hitnotes[hitnotes.length - 1];
    for (let i = 0; i < hitnotes.length; i++) {
        const startNote = hitnotes[i];
        let count = 0;

        // if (last note timing - start note timing) < 10000ms
        const rangeUpToLastNote = math.subtract(lastNote.getTiming(), startNote.getTiming());
        if (math.compare(rangeUpToLastNote, 10000).valueOf() === -1) {
            count = hitnotes.length - i;
            if(math.isZero(rangeUpToLastNote)){
                slidingWindowDensity.push(1);
            } else {
                slidingWindowDensity.push(math.divide(count, rangeUpToLastNote).valueOf() as number * 1000);
            }
        } else {
            for (
                let j = i;
                j < hitnotes.length && math.compare(math.subtract(hitnotes[j].getTiming(), startNote.getTiming()), 10000).valueOf() as number <= 0;
                j++
            ) {
                count++;
            }
            slidingWindowDensity.push(count / 10);
        }
    }

    return slidingWindowDensity;
}

