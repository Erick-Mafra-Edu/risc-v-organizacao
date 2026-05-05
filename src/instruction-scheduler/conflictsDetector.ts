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
 * @param conflicts  recebe array de conflitos já filtrados pelos conflitos sem forwarding
 */
function forwardConflicts(conflicts: Conflicts[]): Conflicts[] {
  return conflicts.filter((conflict) => {
    return conflict.Type === "CONTROL" || conflict.Type === "LOAD";
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
        // dist=1: immediate load-use; dist=2: one instruction gap
        const distance = raw1 ? 1 : 2;
        if (PipelineMode === "CLASSIC") {
          // Without forwarding, a load hazard behaves like any RAW: 2 stalls at
          // dist=1 and 1 stall at dist=2.
          needsStall = true;
          stallCycles = distance === 1 ? 2 : 1;
        } else {
          // With forwarding, a load-use at dist=1 still needs 1 stall because
          // the memory result is not available until after the MEM stage.
          // At dist=2 the data can be forwarded from WB with no stall.
          needsStall = distance === 1;
          stallCycles = distance === 1 ? 1 : 0;
        }
      } else if (type === "RAW") {
        // dist=1 → 2 stalls (Classic), dist=2 → 1 stall (Classic).
        // With forwarding, RAW conflicts are resolved without stalls.
        needsStall = PipelineMode === "CLASSIC";
        stallCycles = PipelineMode === "CLASSIC" ? (raw1 ? 2 : 1) : 0;
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