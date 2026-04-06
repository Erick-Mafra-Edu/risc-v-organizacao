import { Instruction, InstructionOpcode } from "../instructionsType";
declare class R_Instruction extends Instruction {
    private rd;
    private funct3;
    private rs1;
    private rs2;
    private funct7;
    formatedString(): string;
    constructor(opcode: InstructionOpcode | string, rd: string, funct3: string, rs1: string, rs2: string, funct7: string);
}
export default R_Instruction;
export { R_Instruction };
//# sourceMappingURL=R_Instruction.d.ts.map