import { Register, InstructionOpcode, Instruction } from "../instructionsType";
class I_Instruction extends Instruction {
    rd: Register;
    funct3:string;
    rs1: Register;
    imm:string;
    constructor(
        opcode:InstructionOpcode | string,
        rd:string,
        funct3:string,
        rs1:string,
        imm:string
    ){
        super(opcode);
        if(this.opcode !== InstructionOpcode.IL_Type && this.opcode !== InstructionOpcode.JALR_Type && this.opcode !== InstructionOpcode.IAL_Type){
            throw new Error("Opcode Invalid for I-Type Instruction");
        }
        this.rd = new Register(rd);
        this.funct3 = funct3;
        this.rs1 = new Register(rs1);
        this.imm = imm;
    }

    public formatedString(): string {
        return `Instruction of Type I with rd:${this.rd.ABIName} and funct3:${this.funct3} and rs1:${this.rs1.ABIName} and imm:${this.imm}` 
     }
    /**
     * I-Type instructions typically read from rs1
     * @returns rs1 as the register read by I-Type instructions
     */
    public reads(): string[] | null {
        return [this.rs1.ABIName];
    }
    /**
     * I-Type instructions typically write to rd
     * @returns rd as the register written by I-Type instructions
     */
    public writes(): string[] | null {
        return [this.rd.ABIName];
    }
}
export default I_Instruction;
export {I_Instruction};