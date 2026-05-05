import { Instruction, InstructionOpcode, Register } from "../instructionsType";
class B_Instruction extends Instruction {
    public funct3:string;
    public rs1: Register;
    public rs2: Register;
    public imm:string;

    public getMnemonic(): string {
        switch (this.funct3) {
            case "000": return "beq";
            case "001": return "bne";
            case "100": return "blt";
            case "101": return "bge";
            case "110": return "bltu";
            case "111": return "bgeu";
        }
        return `b_type_${this.funct3}`;
    }

    private getImmediateValue(): number {
        const val = parseInt(this.imm, 2);
        if (this.imm[0] === '1') { // 13-bit sign extension (since it's already imm + "0")
            return val - Math.pow(2, 13);
        }
        return val;
    }

    public formatedString(): string {
        const mnemonic = this.getMnemonic();
        const immVal = this.getImmediateValue();
        return `${mnemonic} ${this.rs1.ABIName}, ${this.rs2.ABIName}, ${immVal}`;
    }
    constructor(
        opcode:InstructionOpcode | string,
        imm:string,
        funct3:string,
        rs1:string,
        rs2:string,
    ){
        super(opcode);
        if(this.opcode !== InstructionOpcode.B_Type){
            throw new Error("Opcode Invalid for B-Type Instruction");
        }
        this.funct3 = funct3;
        this.rs1 = new Register(rs1);
        this.rs2 = new Register(rs2);
        this.imm = imm + "0";
    }
    /**
     * B-Type instructions typically read from rs1 and rs2
     * @returns rs1 and rs2 as the registers read by B-Type instructions
     */
    public reads(): string[] | null {
        return [this.rs1.ABIName, this.rs2.ABIName];
    }
    /**
     * B-Type instructions typically do not write to any registers
     * @returns null as B-Type instructions do not write to any registers
     */
    public writes(): string[] | null {
        return null;
    }
}
export default B_Instruction;
export {B_Instruction};