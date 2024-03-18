import { Fraction } from "mathjs";
import * as math from 'mathjs';

export default class Note{
    bpm:Fraction;
    scroll:Fraction;
    realScroll:Fraction;
    type: number;
    measure: Fraction;
    fraction: Fraction;
    delay: Fraction;

    constructor(option:NoteOption){
        this.bpm = option.bpm;
        this.scroll = option.scroll;
        this.realScroll = math.fraction(math.multiply(option.bpm, option.scroll) as (number|Fraction));
        this.type = option.type;
        this.measure = option.measure;
        this.fraction = option.fraction;
        this.delay = math.fraction(math.multiply(this.fraction, math.multiply(math.divide(240, this.bpm), this.measure)) as (number|Fraction));
    }
}

export interface NoteOption{
    bpm:Fraction;
    scroll:Fraction;
    type: number;
    measure: Fraction;
    fraction: Fraction;
}