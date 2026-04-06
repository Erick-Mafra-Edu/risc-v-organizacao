import { Instruction, InstructionOpcode } from "../instructionsType";
class J_Instruction extends Instruction {
    private rd:string
    private imm:string;
    public formatedString(): string {
        return `Instruction of Type J with rd:${this.rd} and imm:${this.imm}` 
    }
    constructor(
        opcode:string,
        rd:string,
        rawImm:string   // bits 31:12 da instrução (20 bits embaralhados: imm[20|10:1|11|19:12])
    ){
        super(opcode);
        if(this.opcode !== InstructionOpcode.J_Type){
            throw new Error("Opcode Invalid for J-Type Instruction");
        }
        this.rd = rd;
        // Remonta o imediato na ordem correta: imm[20|19:12|11|10:1|0]
        this.imm = rawImm[0] +             // imm[20]
                   rawImm.slice(12, 20) +  // imm[19:12]
                   rawImm[11] +            // imm[11]
                   rawImm.slice(1, 11) +   // imm[10:1]
                   "0";                    // imm[0] = 0 (sempre)
    }
}
export default J_Instruction;
export {J_Instruction};