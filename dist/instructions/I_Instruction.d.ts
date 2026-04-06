import InstructionOpcode, { Instruction } from "../instructionsType";
declare class I_Instruction extends Instruction {
    rd: string;
    funct3: string;
    rs1: string;
    imm: string;
    constructor(opcode: InstructionOpcode | string, rd: string, funct3: string, rs1: string, imm: string);
    formatedString(): string;
}
export default I_Instruction;
export { I_Instruction };
//# sourceMappingURL=I_Instruction.d.ts.map