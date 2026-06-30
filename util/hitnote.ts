import { Bar, HitNote } from "tja-parser";

export function getHitNotes(bars: Bar[]){
    const hitnotes: HitNote[] = [];

    bars.forEach((bar) => {
        bar.getNotes().forEach((note) => {
            if(note instanceof HitNote){
                hitnotes.push(note);
            }
        })
    });

    return hitnotes;
}