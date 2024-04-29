import * as math from 'mathjs';
import Note from './Note';

export default class Group {
    bpm: math.Fraction;
    scroll: math.Fraction;
    realScroll: math.Fraction;
    measure: math.Fraction;
    fraction: math.Fraction;
    delay: math.Fraction;
    notes: Note[] = [];//Types of Notes in Group Should Be 1|2|3|4

    constructor(option: GroupOption) {
        this.bpm = option.bpm;
        this.scroll = option.scroll;
        this.realScroll = option.realScroll;
        this.measure = option.measure;
        this.fraction = option.fraction;
        this.delay = option.delay;
    }
}

interface GroupOption {
    bpm: math.Fraction;
    scroll: math.Fraction;
    realScroll: math.Fraction;
    measure: math.Fraction;
    fraction: math.Fraction;
    delay: math.Fraction;
}

interface SubGroup {
    size: 'big' | 'small'
    color: 'red' | 'blue'
    count: number,
    type: 1 | 2 | 3 | 4
}