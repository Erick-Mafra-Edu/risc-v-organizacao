import { Instruction, InstructionOpcode, Register } from "../instructionsType";
class R_Instruction extends Instruction {
    private rd: Register;
    private funct3:string;
    private rs1: Register;
    private rs2: Register;
    private funct7:string;
    public formatedString(): string {
       return `Instruction of Type R with rd:${this.rd.ABIName} and funct3:${this.funct3} and rs1:${this.rs1.ABIName} and rs2:${this.rs2.ABIName} and funct7:${this.funct7}` 
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
        this.rd = new Register(rd);
        this.funct3 = funct3;
        this.rs1 = new Register(rs1);
        this.rs2 = new Register(rs2);
        this.funct7 = funct7;

    }
    /**
     * R-Type instructions typically read from rs1 and rs2
     * @returns rs1 and rs2 as the registers read by R-Type instructions
     */
    public reads(): string[] | null {
        return [this.rs1.ABIName, this.rs2.ABIName];
    }
    /**
     * R-Type instructions typically write to rd
     * @returns rd as the register written by R-Type instructions
     */
    public writes(): string[] | null {
        return [this.rd.ABIName];
    }
}

export default R_Instruction;
export {R_Instruction};