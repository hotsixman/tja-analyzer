import { Song } from "tja-parser";
import { loadAllTja } from "../../tja";
import { getSpecificBranch } from "../../../util";
import getFatigue from "../../../feature/fatigue-stamina-model";
import path from "node:path";

const fatigues: [string, 'oni' | 'ura', number][] = [];
let count = 0;
for await (const tja of loadAllTja()) {
    try {
        console.time('parse');
        var song = Song.parse(tja);
        console.timeEnd('parse');

        if (song.course.oni) {
            console.time('oni');
            const bars = getSpecificBranch(song.course.oni, 'master');
            const fatigue = getFatigue(bars);
            fatigues.push([song.metadata.title ?? '?', 'oni', fatigue]);
            console.log([song.metadata.title ?? '?', 'oni', fatigue]);
            console.timeEnd('oni');
        }
        if (song.course.edit) {
            console.time('ura');
            const bars = getSpecificBranch(song.course.edit, 'master');
            const fatigue = getFatigue(bars);
            fatigues.push([song.metadata.title ?? '?', 'ura', fatigue]);
            console.log([song.metadata.title ?? '?', 'ura', fatigue]);
            console.timeEnd('ura');
        }
        console.log(++count);
    } catch (err) {
        console.error(err);
    }
}

await Bun.write(path.join(import.meta.dir, 'output.json'), JSON.stringify(fatigues, null, 2))

export { };