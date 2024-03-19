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

    getComplexity() {
        if(this.notes.length === 0) return 0;

        let subGroups: SubGroup[] = [];
        let currentSubGroup: SubGroup = {
            size: this.notes[0].type > 2 ? 'big' : 'small',
            color: this.notes[0].type % 2 === 0 ? 'blue' : 'red',
            type: (this.notes[0].type as 1 | 2 | 3 | 4),
            count: 0
        };
        subGroups.push(currentSubGroup);

        this.notes.forEach(note => {
            if (note.type === currentSubGroup.type) {
                currentSubGroup.count++;
            }
            else {
                currentSubGroup = {
                    size: note.type > 2 ? 'big' : 'small',
                    color: note.type % 2 === 0 ? 'blue' : 'red',
                    type: (note.type as 1 | 2 | 3 | 4),
                    count: 1
                }
                subGroups.push(currentSubGroup);
            }
        })

        let complexity = 1;
        //크기 복잡도
        if(math.compare(math.multiply(this.scroll, this.fraction), math.fraction(1, 12)).valueOf() as number > -1){
            for(let i = 0; i < subGroups.length - 1; i++){
                if(subGroups[i].size === subGroups[i+1].size) continue;
                if(subGroups[i].color === subGroups[i+1].color){
                    complexity += 0.5;//색이 같고 크기가 다를 때
                }
                else{
                    complexity += 1;//색과 크기가 다를 때
                }
            }
        }
        //색깔 복잡도
        for(let i = 0; i < subGroups.length - 1; i++){
            let current = subGroups[i];
            let next = subGroups[i+1]
            if(current.color === next.color) continue;
            //짝-짝 패턴
            if(current.count % 2 === 0 && next.count % 2 === 0){
                complexity += 1;
                continue;
            }
            //1-홀 패턴
            if(current.count === 1 && next.count % 2 !== 0){
                complexity += 1.5;
                continue;
            }
            //홀-홀 패턴
            if(current.count % 2 !== 0 && next.count % 2 !== 0){
                complexity += 2;
                continue;
            }
            //짝-홀 패턴
            if(current.count % 2 === 0 && next.count % 2 !== 0){
                complexity += 2.5;
                continue;
            }
            //홀-짝패턴
            if(current.count % 2 !== 0 && next.count % 2 === 0){
                complexity += 3;
                continue;
            }
        }

        return complexity;
    }

    getDensityDifficulty(){
        function bpmDifficulty(x:math.Fraction){
            if(math.compare(x, 200).valueOf() === -1){//(x^2)/2000
                return math.divide(math.square(x), 2000)
            }
            else if (math.compare(x, 200).valueOf() as number >= 0 && math.compare(x, 220).valueOf() === -1){//{(x-200)/5} + 20
                return math.add(math.divide(math.subtract(x, 200) as any, 5), 20)
            }
            else{//[{(x-215)^2}/50] + 23.5
                return math.add(math.divide(math.square(math.subtract(x, 215) as any), 50), math.fraction(23.5))
            }
        }

        function getBpm(delay: math.Fraction){
            return math.fraction(30*delay.d, delay.n);
        }

        return bpmDifficulty(getBpm(this.delay));
    }

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