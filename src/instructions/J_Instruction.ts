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
        imm:string
    ){
        super(opcode);
        if(this.opcode !== InstructionOpcode.J_Type){
            throw new Error("Opcode Invalid for J-Type Instruction");
        }
        this.rd = rd;
        this.imm = imm;
    }
}
export default J_Instruction;
export {J_Instruction};