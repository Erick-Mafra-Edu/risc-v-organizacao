import { Instruction } from "./instructionsType";
declare class InstructionDetector {
    instructionHexadecimal: string;
    InstructionBinary: string;
    constructor(instructionString: string);
    static detectInstruction(instructionString: string): Instruction;
}
export default InstructionDetector;
export { InstructionDetector };
//# sourceMappingURL=instructionDetector.d.ts.map