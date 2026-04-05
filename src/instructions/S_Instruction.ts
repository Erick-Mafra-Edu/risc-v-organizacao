import { Instruction,InstructionOpcode } from "../instructionsType";

class S_Instruction extends Instruction {
    private funct3:string;
    private rs1:string;
    private rs2:string;
    private imm:string;
    public formatedString(): string {
        return `Instruction of Type S with funct3:${this.funct3} and rs1:${this.rs1} and rs2:${this.rs2} and imm:${this.imm}` 
    }
    constructor(
        opcode:string,
        funct3:string,
        rs1:string,
        rs2:string,
        imm_4_0:string,
        imm_11_5:string
    ){
        super(opcode);
        if(this.opcode !== InstructionOpcode.S_Type){
            throw new Error("Opcode Invalid for S-Type Instruction");
        }
        this.funct3 = funct3;
        this.rs1 = rs1;
        this.rs2 = rs2;
        this.imm = imm_11_5 + imm_4_0;
    }
}
export default S_Instruction;
export {S_Instruction};