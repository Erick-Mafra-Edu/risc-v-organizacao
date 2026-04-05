import { Instruction, InstructionOpcode } from "../instructionsType";
class R_Instruction extends Instruction {
    private rd:string;
    private funct3:string;
    private rs1:string;
    private rs2:string;
    private funct7:string;
    public formatedString(): string {
       return `Instruction of Type R with rd:${this.rd} and funct3:${this.funct3} and rs1:${this.rs1} and rs2:${this.rs2} and funct7:${this.funct7}` 
    }
    constructor(
        opcode:InstructionOpcode | string,
        rd:string,
        funct3:string,
        rs1:string,
        rs2:string,
        funct7:string
    ){
        super(opcode);
        if(this.opcode !== InstructionOpcode.R_Type){
            throw new Error("Opcode Invalid for R-Type Instruction");
        }
        this.rd = rd;
        this.funct3 = funct3;
        this.rs1 = rs1;
        this.rs2 = rs2;
        this.funct7 = funct7;

    }
}

export default R_Instruction;
export {R_Instruction};