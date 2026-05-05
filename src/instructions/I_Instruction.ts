import { Register, InstructionOpcode, Instruction } from "../instructionsType";
class I_Instruction extends Instruction {
    public rd: Register;
    public funct3:string;
    public rs1: Register;
    public imm:string;
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

    public getMnemonic(): string {
        if (this.opcode === InstructionOpcode.IAL_Type) {
            switch (this.funct3) {
                case "000": return "addi";
                case "010": return "slti";
                case "011": return "sltiu";
                case "100": return "xori";
                case "110": return "ori";
                case "111": return "andi";
                case "001": return "slli";
                case "101": 
                    // Need to check imm[11:5] for srai vs srli, but let's simplify for now
                    return this.imm.startsWith("01") ? "srai" : "srli";
            }
        } else if (this.opcode === InstructionOpcode.IL_Type) {
            switch (this.funct3) {
                case "000": return "lb";
                case "001": return "lh";
                case "010": return "lw";
                case "100": return "lbu";
                case "101": return "lhu";
            }
        } else if (this.opcode === InstructionOpcode.JALR_Type) {
            return "jalr";
        }
        return `i_type_${this.opcode}_${this.funct3}`;
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
        if (this.opcode === InstructionOpcode.IL_Type) {
            return `${mnemonic} ${this.rd.ABIName}, ${immVal}(${this.rs1.ABIName})`;
        }
        return `${mnemonic} ${this.rd.ABIName}, ${this.rs1.ABIName}, ${immVal}`;
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