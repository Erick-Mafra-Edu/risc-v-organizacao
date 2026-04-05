import { Instruction, InstructionOpcode } from "../instructionsType";
class U_Instruction extends Instruction {
    private rd:string;
    private imm:string;
    public formatedString(): string {
        return `Instruction of Type U with rd:${this.rd} and imm:${this.imm}` 
    }
    constructor(
        opcode:string,
        rd:string,
        imm:string
    ){
        super(opcode);
        if(this.opcode !== InstructionOpcode.ULUI_Type && this.opcode !== InstructionOpcode.UAUIPC_Type){
            throw new Error("Opcode Invalid for U-Type Instruction");
        }
        this.rd = rd;
        this.imm = imm;
    }
}
export default U_Instruction;
export {U_Instruction};