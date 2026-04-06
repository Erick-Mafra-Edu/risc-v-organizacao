import { Instruction } from "../instructionsType";
declare class S_Instruction extends Instruction {
    private funct3;
    private rs1;
    private rs2;
    private imm;
    formatedString(): string;
    constructor(opcode: string, funct3: string, rs1: string, rs2: string, imm_4_0: string, imm_11_5: string);
}
export default S_Instruction;
export { S_Instruction };
//# sourceMappingURL=S_Instruction.d.ts.map