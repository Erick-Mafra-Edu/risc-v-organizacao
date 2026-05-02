import { Instruction, InstructionOpcode, Register } from "../instructionsType";
class J_Instruction extends Instruction {
    private rd: Register;
    private imm:string;
    public formatedString(): string {
        return `Instruction of Type J with rd:${this.rd.ABIName} and imm:${this.imm}` 
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
        this.rd = new Register(rd);
        this.imm = imm + "0";
    }
    /**
     * J-Type instructions typically do not read from registers
     * @returns null as J-Type instructions do not read from any registers
     */
    public reads(): string[] | null {
        return null;
    }
    /**
     * J-Type instructions typically write to rd
     * @returns rd as the register written by J-Type instructions
     */
    public writes(): string[] | null {
        return [this.rd.ABIName];
    }
}
export default J_Instruction;
export {J_Instruction};