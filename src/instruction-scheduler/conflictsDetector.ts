import { Instruction } from "../instructionsType";
function detectRAWConflict(
  previousWrites: string[],
  currentReads: string[]
): boolean {
  return currentReads.some(read => previousWrites.includes(read));
}
function filterZeroRegisters(registers: string[]): string[] {
       return registers.filter(register => register !== "zero");
}

function detectWAWConflict(previousWrites: string[], currentWrites: string[]): boolean {
    return currentWrites.some(write => previousWrites.includes(write));
}

function detectWARConflict(previousReads: string[], currentReads: string[], currentWrites: string[]): boolean {
    return currentWrites.some(write => previousReads.includes(write));
}

/**
 * filtra utilizando os conflitos já encontrados apenas verificamos se necessita de stall/nop
 * @param instructions  recebe array de instruções já filtradas pelos conflitos sem fowarding
 */
function forwardConflicts(instructions: Instruction[]): Instruction[] {
  return instructions.filter((instruction, index, instructionsArray) => {
    return controlConflict(instruction) || loadConflict(instruction);
  });
}
function controlConflict(instruction:Instruction):boolean {
  const type = instruction.getType();
  return type === "BRANCH" || type === "JUMP";
}
function loadConflict(instruction:Instruction):boolean {
  const type = instruction.getType();
  return type === "LOAD";
}
function conflictsDetectorPipelineClassico(
  instructions: Instruction[],
  PipelineMode: "CLASSIC" | "FORWARDING" = "CLASSIC"
): Instruction[] {
  let returnInstruction : Instruction[] = [];
  
  returnInstruction = instructions.filter((instruction, index, instructionsArray) => {
    const previousInstruction = instructionsArray[index - 1];
    const previousInstruction2 = instructionsArray[index - 2];

    const previousWrites = filterZeroRegisters(previousInstruction?.writes() ?? []);
    const previousWrites2 = filterZeroRegisters(previousInstruction2?.writes() ?? []);
    const currentReads = filterZeroRegisters(instruction.reads() ?? []);


    // - Instrução -1 (em estágio MEM)
    // - Instrução -2 (em estágio EX, menos crítico)
    
    const hasConflictWithPrevious = detectRAWConflict(previousWrites, currentReads);
    const hasConflictWithPrevious2 = detectRAWConflict(previousWrites2, currentReads);

    return hasConflictWithPrevious || hasConflictWithPrevious2 || controlConflict(instruction);
  });
  if (PipelineMode === "FORWARDING") 
    return forwardConflicts(returnInstruction);
  return returnInstruction;
}



export {conflictsDetectorPipelineClassico, detectRAWConflict, detectWAWConflict, detectWARConflict};