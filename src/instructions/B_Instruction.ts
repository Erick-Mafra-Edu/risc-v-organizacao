import { Instruction, InstructionOpcode } from "../instructionsType";
class B_Instruction extends Instruction {
    private funct3:string;
    private rs1:string;
    private rs2:string;
    private imm:string;
    public formatedString(): string {
        return `Instruction of Type B with funct3:${this.funct3} and rs1:${this.rs1} and rs2:${this.rs2} and imm:${this.imm}` 
    }
    constructor(
        opcode:InstructionOpcode | string,
        funct3:string,
        rs1:string,
        rs2:string,
        imm:string,  // imm completo pré-montado: imm[12|11|10:5|4:1|0]
    ){
        super(opcode);
        if(this.opcode !== InstructionOpcode.B_Type){
            throw new Error("Opcode Invalid for B-Type Instruction");
        }
        this.funct3 = funct3;
        this.rs1 = rs1;
        this.rs2 = rs2;
        this.imm = imm;
    }
}
export default B_Instruction;
export {B_Instruction};