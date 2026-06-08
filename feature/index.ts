import { Course } from "tja-parser";
import { getAverageDensity } from "./average-density";
import { getFixedIntervalDensity } from "./fixed-interval-density";
import { getSegmentalDensity } from "./segmental-density";

export function featurize(course: Course) {
    const averageDensity = getAverageDensity(course);
    const fixedIntervalDensity = getFixedIntervalDensity(course);
    const segmentalDensity = getSegmentalDensity(course);

    return {
        averageDensity,
        fixedIntervalDensity,
        segmentalDensity,
    }
}
