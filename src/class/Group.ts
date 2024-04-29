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
    colorChanges: number = 0;
    sizeChanges: number = 0;

    constructor(option: GroupOption) {
        this.bpm = option.bpm;
        this.scroll = option.scroll;
        this.realScroll = option.realScroll;
        this.measure = option.measure;
        this.fraction = option.fraction;
        this.delay = option.delay;

        this.notes.forEach((n, i, a) => {
            if(i + 1 == a.length) return;
            if((n.type < 3) !== (a[i+1].type < 3)){
                this.sizeChanges++;
            }
            if((n.type % 2) !== (a[i+1].type % 2)){
                this.colorChanges++;
            }
        })
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