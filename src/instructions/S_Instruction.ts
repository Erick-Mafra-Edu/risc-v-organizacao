import { Instruction, InstructionOpcode, Register } from "../instructionsType";

class S_Instruction extends Instruction {
    public funct3:string;
    public rs1: Register;
    public rs2: Register;
    public imm:string;

    public getMnemonic(): string {
        switch (this.funct3) {
            case "000": return "sb";
            case "001": return "sh";
            case "010": return "sw";
        }
        return `s_type_${this.funct3}`;
    }

    private getImmediateValue(): number {
        const val = parseInt(this.imm, 2);
        if (this.imm[0] === '1') { // 12-bit sign extension
            return val - Math.pow(2, 12);
        }
        return val;
    }

    public formatedString(): string {
        const mnemonic = this.getMnemonic();
        const immVal = this.getImmediateValue();
        return `${mnemonic} ${this.rs2.ABIName}, ${immVal}(${this.rs1.ABIName})`;
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
        this.rs1 = new Register(rs1);
        this.rs2 = new Register(rs2);
        this.imm = imm_11_5 + imm_4_0;
    }
    /**
     * S-Type instructions typically read from rs1 and rs2
     * @returns rs1 and rs2 as the registers read by S-Type instructions
     */
    public reads(): string[] | null {
        return [this.rs1.ABIName, this.rs2.ABIName];
    }
    /**
     * S-Type instructions typically do not write to any registers
     * @returns null as S-Type instructions do not write to any registers
     */
    public writes(): string[] | null {
        return null; 
    }
}
export default S_Instruction;
export {S_Instruction};