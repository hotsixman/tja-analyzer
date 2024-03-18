import math from 'mathjs';
import Note from './Note';

export default class Group{
    bpm:math.Fraction;
    scroll:math.Fraction;
    realScroll:math.Fraction;
    measure:math.Fraction;
    fraction:math.Fraction;
    delay:math.Fraction;
    notes:Note[];

    constructor(option:GroupOption){
        this.bpm = option.bpm;
        this.scroll = option.scroll;
        this.realScroll = option.realScroll;
        this.measure = option.measure;
        this.fraction = option.fraction;
        this.delay = option.delay;
    }
}

interface GroupOption{
    bpm:math.Fraction;
    scroll:math.Fraction;
    realScroll:math.Fraction;
    measure:math.Fraction;
    fraction:math.Fraction;
    delay:math.Fraction;
}