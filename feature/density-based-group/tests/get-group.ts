import { Course, Song } from 'tja-parser';
import { sampleTja } from '../../../tests/sample';
import { getSpecificBranch } from '../../../util';
import { getGroupByDensity } from '..';

const song = Song.parse(sampleTja);
const bars = getSpecificBranch(song.course.edit as Course, 'master');
console.log(getGroupByDensity(bars).map((e) => e.map(note => [note.getDelay().valueOf(), note.getNoteLength(), note.getBPM()])))