import { Instruction } from "../instructionsType";
declare class U_Instruction extends Instruction {
    private rd;
    private imm;
    formatedString(): string;
    constructor(opcode: string, rd: string, imm: string);
}
export default U_Instruction;
export { U_Instruction };
//# sourceMappingURL=U_Instruction.d.ts.map