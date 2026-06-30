import { Bar, HitNote } from "tja-parser";
import { getHitNotes } from "../../util/hitnote";
import * as math from 'mathjs';

/**
 * @param interval second
 */
export default function getIntervalDensity(bars: Bar[], interval: number = 10): number[] {
    const hitNotes = getHitNotes(bars);
    const startNote = hitNotes[0];

    const groups: HitNote[][] = [];
    let currentGroup: HitNote[];
    let currentGroupStartTiming: math.Fraction;

    hitNotes.forEach((note) => {
        if(!currentGroup){
            currentGroup = [];
            groups.push(currentGroup);
        }
        if(!currentGroupStartTiming){
            currentGroupStartTiming = startNote.getTiming();
        }

        if(math.compare(math.subtract(note.getTiming(), currentGroupStartTiming), interval * 1000).valueOf() === 1){
            currentGroup = [];
            groups.push(currentGroup);
            currentGroupStartTiming = math.add(currentGroupStartTiming, math.fraction(interval * 1000))
        }

        currentGroup.push(note);
    });

    return groups.map((group, i) => {
        if(i === groups.length - 1){
            return math.divide(group.length, math.subtract(group[group.length - 1].getTiming(), group[0].getTiming())).valueOf() as number * 1000;
        } else {
            return group.length / interval;
        }
    })
}