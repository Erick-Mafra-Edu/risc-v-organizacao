import { Instruction } from "../instructionsType";
function detectRAWConflict(previousWrites: string[], currentReads: string[], currentWrites: string[], nextReads: string[]): boolean {
    return currentReads.some(read => previousWrites.includes(read)) || 
           nextReads.some(read => currentWrites.includes(read));
}

function detectWAWConflict(previousWrites: string[], currentWrites: string[], nextWrites: string[]): boolean {
    return currentWrites.some(write => previousWrites.includes(write)) || 
           nextWrites.some(write => currentWrites.includes(write));
}

function detectWARConflict(previousReads: string[], currentReads: string[], currentWrites: string[], nextWrites: string[]): boolean {
    return currentWrites.some(write => previousReads.includes(write)) || 
           nextWrites.some(write => currentReads.includes(write));
}

function conflictsDetector(instructions: Instruction[]) : Instruction[] {

 return instructions.filter((instruction, index,instructionsArray) => {
    const previousInstruction = instructionsArray[index - 1];
    const nextInstruction = instructionsArray[index + 1];
    const previousReads = (previousInstruction?.reads() ?? []);
    const previousWrites = (previousInstruction?.writes() ?? []);
    const currentReads = (instruction.reads() ?? []);
    const currentWrites = (instruction.writes() ?? []);
    const nextReads = (nextInstruction?.reads() ?? []);
    
    return detectRAWConflict(previousWrites, currentReads, currentWrites, nextReads) ||
           detectWARConflict(previousReads, currentReads, currentWrites, nextReads) ||
           detectWAWConflict(previousWrites, currentWrites, nextReads);
    });
}
export {conflictsDetector};