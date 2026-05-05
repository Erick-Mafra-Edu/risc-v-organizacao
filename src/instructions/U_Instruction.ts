import { Instruction, InstructionOpcode, Register } from "../instructionsType";
class U_Instruction extends Instruction {
    public rd: Register;
    public imm:string;

    public getMnemonic(): string {
        return this.opcode === InstructionOpcode.ULUI_Type ? "lui" : "auipc";
    }

    public formatedString(): string {
        const mnemonic = this.getMnemonic();
        const immVal = parseInt(this.imm, 2);
        return `${mnemonic} ${this.rd.ABIName}, 0x${immVal.toString(16).toUpperCase()}`;
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