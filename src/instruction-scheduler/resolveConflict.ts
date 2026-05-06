import { Instruction } from "../instructionsType";
import { B_Instruction, I_Instruction, J_Instruction } from "../instructions";
import { log } from "node:console";
import { Conflicts } from "./conflictsDetector";

const logLevel = process.env.LOG_LEVEL || "INFO";

function createNopInstruction(): Instruction {
    return new I_Instruction(
        "0010011",
        "00000", // rd
        "000", // funct3
        "00000", // rs1
        "000000000000"   // imm[11:0]
    ); //nop operation
}

function ResolveConflict(
  conflicts: Conflicts[],
  originalInstructions: Instruction[],
): Instruction[] {
  return ResolveConflictWithAddressMap(conflicts, originalInstructions).instructions;
}

interface ResolvedInstructions {
  instructions: Instruction[];
  addressMap: Record<number, number>;
}

function ResolveConflictWithAddressMap(
  conflicts: Conflicts[],
  originalInstructions: Instruction[],
): ResolvedInstructions {
  const result: Instruction[] = [];
  const oldToNewIndex = new Map<number, number>();

  originalInstructions.forEach((instruction, index) => {
    const conflict = conflicts.find(c => c.Index === index);

    if (conflict && conflict.NeedsStall) {
      for (let i = 0; i < conflict.StallCycles; i++) {
        result.push(createNopInstruction());
      }
    }
    if (logLevel === "DEBUG")
        if (conflict) {
            log(`Instruction at index ${index} (${instruction.formatedString()}) has a conflict of type ${conflict.Type}. Needs stall: ${conflict.NeedsStall}, Stall cycles: ${conflict.StallCycles}`);
        }
    
    oldToNewIndex.set(index, result.length);
    result.push(instruction);
  });

  const recalculatedInstructions = result.map((instruction, newIndex) => {
    if (!(instruction instanceof B_Instruction) && !(instruction instanceof J_Instruction)) {
      return instruction;
    }

    const oldIndex = findOriginalIndex(oldToNewIndex, newIndex);
    if (oldIndex === undefined) {
      return instruction;
    }

    const oldOffsetBytes = instruction.getImmediateValue();
    const oldTargetIndex = oldIndex + oldOffsetBytes / 4;

    if (!Number.isInteger(oldTargetIndex)) {
      return instruction;
    }

    const targetNewIndex = getMappedTargetIndex(oldTargetIndex, oldToNewIndex, originalInstructions.length, result.length);
    if (targetNewIndex === undefined) {
      return instruction;
    }

    const newOffsetBytes = (targetNewIndex - newIndex) * 4;
    return instruction.withImmediateValue(newOffsetBytes);
  });

  return {
    instructions: recalculatedInstructions,
    addressMap: Object.fromEntries(oldToNewIndex.entries())
  };
}

function findOriginalIndex(oldToNewIndex: Map<number, number>, newIndex: number): number | undefined {
  for (const [oldIndex, mappedNewIndex] of oldToNewIndex.entries()) {
    if (mappedNewIndex === newIndex) {
      return oldIndex;
    }
  }

  return undefined;
}

function getMappedTargetIndex(
  oldTargetIndex: number,
  oldToNewIndex: Map<number, number>,
  originalLength: number,
  resolvedLength: number
): number | undefined {
  if (oldTargetIndex === originalLength) {
    return resolvedLength;
  }

  if (oldTargetIndex < 0 || oldTargetIndex > originalLength) {
    return undefined;
  }

  return oldToNewIndex.get(oldTargetIndex);
}
export default ResolveConflict;
export { ResolveConflict, ResolveConflictWithAddressMap, type ResolvedInstructions };
