import {Song, TJAParser} from '@hotsixman/tja';
import Course from './Course';

export default class Fumen{
    readonly song:Song;
    readonly courses:Course[] = [];

    constructor(tja:string){
        this.song = TJAParser.parse(tja);

        this.song.courses.forEach(course => {
            this.courses.push(new Course(course, this.song.bpm));
        })
    }
}