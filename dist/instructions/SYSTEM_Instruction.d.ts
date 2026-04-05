import { Instruction, InstructionOpcode } from "../instructionsType";
declare class SYSTEM_Instruction extends Instruction {
    private funct3;
    private rs1;
    private rd;
    private imm;
    formatedString(): string;
    constructor(opcode: InstructionOpcode | string, rd: string, funct3: string, rs1: string, imm: string);
    getOpcode(): InstructionOpcode;
}
export default SYSTEM_Instruction;
export { SYSTEM_Instruction };
//# sourceMappingURL=SYSTEM_Instruction.d.ts.map