import { Course, Song } from "tja-parser";
import Bun from 'bun';
import path from 'node:path';
import featurize from "../../feature";
import { getSpecificBranch } from "../../util";

const tja = await Bun.file(path.join(import.meta.dir, './sample.tja')).text();
const song = Song.parse(tja);

const course = song.course.edit as Course;
const bars = getSpecificBranch(course, 'master');
console.log(featurize(bars))