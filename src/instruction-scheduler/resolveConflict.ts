import { Instruction } from "../instructionsType";
import { I_Instruction } from "../instructions";
import { log } from "node:console";
import { controlConflict, loadConflict,Conflicts } from "./conflictsDetector";


process.env.LOG_LEVEL = "DEBUG"; // Set log level to DEBUG for detailed output
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
  const result: Instruction[] = [];

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
    
    result.push(instruction);
  });

  return result;
}
export default ResolveConflict;
export { ResolveConflict };