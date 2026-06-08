import { Bar, Course, HitNote } from "tja-parser";
import { getSpecificBranch } from "../../util";
import * as math from "mathjs";

/**
 * Divides the course into N equal time segments and calculates the density (notes/s) for each.
 * @param course The TJA course to analyze
 * @param segments Number of segments to divide the course into (default: 20)
 * @returns An array of densities (vector)
 */
export function getSegmentalDensity(course: Course, segments: number = 20): number[] {
    const bars = getSpecificBranch(course, "master");
    
    // Extract all hit notes with their timings
    const hitNotes = bars.flatMap(bar => bar.getNotes().filter(note => note instanceof HitNote)) as HitNote[];

    if (hitNotes.length < 2) {
        return new Array(segments).fill(0);
    }

    const startTime = hitNotes[0].getTiming();
    const endTime = hitNotes[hitNotes.length - 1].getTiming();
    const totalDuration = math.subtract(endTime, startTime);

    if (math.smallerEq(totalDuration, 0)) {
        return new Array(segments).fill(0);
    }

    const segmentDuration = math.divide(totalDuration, segments);
    const densities: number[] = [];

    for (let i = 0; i < segments; i++) {
        const segStart = math.add(startTime, math.multiply(i, segmentDuration));
        const segEnd = (i === segments - 1) 
            ? math.add(endTime, 0.0001) // Include the very last note
            : math.add(startTime, math.multiply(i + 1, segmentDuration));

        const notesInSegment = hitNotes.filter(note => {
            const t = note.getTiming();
            return math.largerEq(t, segStart) && math.smaller(t, segEnd);
        });

        // Density = count / duration (in seconds)
        const density = math.divide(notesInSegment.length, segmentDuration);
        densities.push(1000 * (density.valueOf() as number));
    }

    return densities;
}
