import { Instruction, InstructionOpcode, Register } from "../instructionsType";

class SYSTEM_Instruction extends Instruction {
    public funct3: string;
    public rs1: Register;
    public rd: Register;
    public imm: string;

    public getMnemonic(): string {
        if (this.imm === "000000000000") return "ecall";
        if (this.imm === "000000000001") return "ebreak";
        return `system_${this.imm}`;
    }

    public formatedString(): string {
        return this.getMnemonic();
    }

    constructor(
        opcode: InstructionOpcode | string,
        rd: string,
        funct3: string,
        rs1: string,
        imm: string
    ) {
        super(opcode);
        if (this.opcode !== InstructionOpcode.SYSTEM_Type) {
            throw new Error("Opcode must be SYSTEM_Type for SYSTEM_Instruction");
        }
        this.rd = new Register(rd);
        this.funct3 = funct3;
        this.rs1 = new Register(rs1);
        this.imm = imm;
    }

    public reads(): string[] | null {
        return [this.rs1.ABIName]; 
    }
    public writes(): string[] | null {
        return [this.rd.ABIName]; 
    }
}

export default SYSTEM_Instruction;
export { SYSTEM_Instruction };
