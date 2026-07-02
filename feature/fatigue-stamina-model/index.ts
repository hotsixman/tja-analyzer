import { Bar } from "tja-parser";
import { getHitNotes } from "../../util/hitnote";
import * as math from 'mathjs';

export default function getFatigue(bars: Bar[], constants?: { a: number, b: number }) {
    let fatigue = math.fraction(0);
    const hitNotes = getHitNotes(bars);
    const a = math.fraction(constants?.a ?? 0.005);
    const b = math.fraction(constants?.b ?? 0.1)

    for (let i = 0; i < hitNotes.length - 1; i++) {
        fatigue = math.add(fatigue, math.divide(100, hitNotes[i].getDelay()));

        const innerRoot = math.fraction(
            math.subtract(
                math.square(
                    math.add(math.fraction(fatigue), math.fraction(b))
                ),
                math.multiply(math.fraction(2), a, hitNotes[i].getDelay())
            ) as any
        );

        if (math.compare(innerRoot, 0).valueOf() === -1) {
            fatigue = math.fraction(0);
        } else {
            fatigue = math.max(
                math.add(
                    math.multiply(b, -1),
                    math.fraction(math.sqrt(math.bignumber(innerRoot)))
                ),
                0
            )
        }
    }
    fatigue = math.add(fatigue, math.fraction(1));

    return math.number(fatigue);
}