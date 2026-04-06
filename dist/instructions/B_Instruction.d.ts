import { Instruction, InstructionOpcode } from "../instructionsType";
declare class B_Instruction extends Instruction {
    private funct3;
    private rs1;
    private rs2;
    private imm;
    formatedString(): string;
    constructor(opcode: InstructionOpcode | string, imm_4_1: string, imm_10_5: string, funct3: string, rs1: string, rs2: string);
}
export default B_Instruction;
export { B_Instruction };
//# sourceMappingURL=B_Instruction.d.ts.map