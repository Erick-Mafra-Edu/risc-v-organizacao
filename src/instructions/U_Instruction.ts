import { Instruction, InstructionOpcode, Register } from "../instructionsType";
class U_Instruction extends Instruction {
    private rd: Register;
    private imm:string;
        public formatedString(): string {
            return `Instruction of Type U with rd:${this.rd.ABIName} and imm:${this.imm}` 
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
        this.rd = new Register(rd);
        this.imm = imm;
    }
    /**
     *  U-Type instructions typically do not read from registers
     * @returns null as U-Type instructions do not read from any registers
     */
    public reads(): string[] | null {
        return null; 
    }
    /**
     * U-Type instructions typically write to rd
     * @returns rd as the register written by U-Type instructions
     */
    public writes(): string[] | null {
        return [this.rd.ABIName]; 
    }

}
export default U_Instruction;
export {U_Instruction};