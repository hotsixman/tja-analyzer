import path from 'node:path';
import fs from 'node:fs/promises';

export async function* loadAllTja(){
    const entries = (await fs.readdir(import.meta.dir)).filter((e) => path.extname(e) === '.tja').toSorted();

    for(const entry of entries){
        const filepath = path.join(import.meta.dir, entry);
        const tja = Bun.file(filepath);

        try{
            yield await tja.text()
        } catch {}
    }

    return
}