import {Song, TJAParser} from '@hotsixman/tja';
import Course from './Course';

export default class Fumen{
    private _song:Song;
    private _courses:Course[] = [];

    constructor(tja:string){
        this._song = TJAParser.parse(tja);

        this._song.courses.forEach(course => {
            this._courses.push(new Course(course, this._song.bpm));
        })
    }
}