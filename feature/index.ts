import { Bar } from "tja-parser";
import getAverageDensity from './average-density';
import getIntervalDensity from './interval-density';
import getSlidingWindowDensity from './sliding-window-density';
import getSegmentalDensity from "./segmental-density";

export default function featurize(bars: Bar[]) {
    const averageDensity = getAverageDensity(bars);
    const intervalDensity = getIntervalDensity(bars);
    const slidingWindowDensity = getSlidingWindowDensity(bars);
    const segmentalDensity = getSegmentalDensity(bars);

    return {
        averageDensity,
        intervalDensity,
        slidingWindowDensity,
        segmentalDensity
    }
}
