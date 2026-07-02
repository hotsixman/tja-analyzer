import { Bar, Branch, Course, HitNote } from "tja-parser";
export * as math from 'mathjs';

export function getSpecificBranch(course: Course, branch: 'normal' | 'advanced' | 'master'): Bar[] {
    const bars: Bar[] = [];
    course.noteGroups.forEach((n) => {
        if (n instanceof Bar) {
            bars.push(n);
        }
        else if (n instanceof Branch) {
            let branchBars: Bar[] | undefined = undefined;
            if (branch === "master") {
                branchBars = n.master ?? n.advanced ?? n.normal;
            } else if(branch === "advanced"){
                branchBars = n.advanced ?? n.normal;
            } else if(branch === "normal"){
                branchBars = n.normal;
            }

            if (branchBars) {
                bars.push(...branchBars);
            }
        }
    });
    return bars;
}


export function getFirstHitNote(bars: Bar[]) {
    for (const bar of bars) {
        for (const note of bar.getNotes()) {
            if (note instanceof HitNote) {
                return note;
            }
        }
    }
}

export function getLastHitNote(bars: Bar[]){
    for(const bar of bars.toReversed()){
        for(const note of bar.getNotes().toReversed()){
            if (note instanceof HitNote) {
                return note;
            }
        }
    }
}