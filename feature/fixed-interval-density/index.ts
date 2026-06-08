import { Course, HitNote } from "tja-parser";
import { getSpecificBranch } from "../../util";

export function getFixedIntervalDensity(course: Course) {
    const bars = getSpecificBranch(course, 'master');

    const densities: number[] = [];
    let startNote: HitNote | null = null;
    let count = -1;

    for (const bar of bars) {
        for (const note of bar.getNotes()) {
            if (!(note instanceof HitNote)) {
                continue;
            }

            // 구간 10초(10000 ms)
            if (!startNote) {
                startNote = note;
            } else if (note.getTimingMS() > startNote.getTimingMS() + 10000) {
                startNote = note;
                densities.push(count / 10);
                count = -1;
            }

            if (count === -1) {
                count = 0;
            }
            count++;
        }
    }

    if (count === -1) {
        densities.push(count / 10);
    }

    return densities;
}