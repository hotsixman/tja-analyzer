import { Course, Song } from "tja-parser";
import Bun from 'bun';
import { featurize } from "../../feature";

const tja = await Bun.file('./sample.tja').text();
const song = Song.parse(tja);

const course = song.course.edit as Course;
const features = featurize(course);

console.log(features);