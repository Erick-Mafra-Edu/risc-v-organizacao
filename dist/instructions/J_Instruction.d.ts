import { Instruction } from "../instructionsType";
declare class J_Instruction extends Instruction {
    private rd;
    private imm;
    formatedString(): string;
    constructor(opcode: string, rd: string, imm: string);
}
export default J_Instruction;
export { J_Instruction };
//# sourceMappingURL=J_Instruction.d.ts.map