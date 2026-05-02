import { Instruction } from "../instructionsType";
function detectRAWConflict(
  previousWrites: string[],
  currentReads: string[]
): boolean {
  return currentReads.some(read => previousWrites.includes(read));
}

interface Conflicts {
  INSTRUCTION: Instruction;
  Type: "RAW" | "WAW" | "WAR" | "CONTROL" | "LOAD";
  Index: number;
  NeedsStall: boolean;
  StallCycles: number;
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
 * @param instructions  recebe array de conflitos já filtrados pelos conflitos sem fowarding
 */
function forwardConflicts(conflicts: Conflicts[]): Conflicts[] {
  return conflicts.filter((conflict) => {
    return controlConflict(conflict.INSTRUCTION) || loadConflict(conflict.INSTRUCTION);
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
): Conflicts[] {
  const returnInstruction: Conflicts[] = [];

  instructions.forEach((instruction, index, instructionsArray) => {
    const previousInstruction = instructionsArray[index - 1];
    const previousInstruction2 = instructionsArray[index - 2];

    const previousWrites = filterZeroRegisters(previousInstruction?.writes() ?? []);
    const previousWrites2 = filterZeroRegisters(previousInstruction2?.writes() ?? []);
    const currentReads = filterZeroRegisters(instruction.reads() ?? []);

    const raw1 = detectRAWConflict(previousWrites, currentReads);
    const raw2 = detectRAWConflict(previousWrites2, currentReads);
    const loadHazard1 =
      previousInstruction !== undefined &&
      loadConflict(previousInstruction) &&
      raw1;
    const loadHazard2 =
      previousInstruction2 !== undefined &&
      loadConflict(previousInstruction2) &&
      raw2;
    const isLoadHazard = loadHazard1 || loadHazard2;
    const isControl = controlConflict(instruction);

    if (raw1 || raw2 || isControl) {
      let type: Conflicts["Type"] =
        isControl ? "CONTROL" :
        isLoadHazard ? "LOAD" :
        "RAW";

      let needsStall = false;
      let stallCycles = 0;

      if (isControl) {
        needsStall = true;
        stallCycles = 2;
      } else if (isLoadHazard) {
        needsStall = true;
        const distance = raw1 ? 1 : 2;
        needsStall = true;
        stallCycles = PipelineMode === "CLASSIC" ? distance : Math.max(distance - 1, 0);
      } else if (type === "RAW") {
        needsStall = PipelineMode === "CLASSIC";
        stallCycles = PipelineMode === "CLASSIC" ? 1 : 0;
      }

      returnInstruction.push({
        INSTRUCTION: instruction,
        Type: type,
        Index: index,
        NeedsStall: needsStall,
        StallCycles: stallCycles
      });
    }
  });

  return returnInstruction;
}



export {conflictsDetectorPipelineClassico, 
  detectRAWConflict, 
  detectWAWConflict, 
  detectWARConflict,
  controlConflict,
  loadConflict,
  forwardConflicts,
  type Conflicts
};