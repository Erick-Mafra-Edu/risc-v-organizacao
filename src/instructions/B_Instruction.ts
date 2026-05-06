import { Instruction, InstructionOpcode, Register } from "../instructionsType";
class B_Instruction extends Instruction {
    private funct3:string;
    private rs1: Register;
    private rs2: Register;
    private imm:string;
    public formatedString(): string {
        return `Instruction of Type B with funct3:${this.funct3} and rs1:${this.rs1.ABIName} and rs2:${this.rs2.ABIName} and imm:${this.imm}` 
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
    public getImmediate(): string {
        return this.imm;
    }
    public getImmediateValue(): number {
        const value = parseInt(this.imm, 2);
        return (value << (32 - this.imm.length)) >> (32 - this.imm.length);
    }
    public withImmediateValue(offsetBytes: number): B_Instruction {
        return new B_Instruction(
            InstructionOpcode.B_Type,
            B_Instruction.encodeImmediate(offsetBytes),
            this.funct3,
            this.rs1.binary,
            this.rs2.binary
        );
    }
    private static encodeImmediate(offsetBytes: number): string {
        if (offsetBytes % 2 !== 0) {
            throw new Error("B-Type immediate must be aligned to 2 bytes");
        }
        if (offsetBytes < -4096 || offsetBytes > 4094) {
            throw new Error("B-Type immediate out of range");
        }

        const encoded = (offsetBytes & 0x1fff).toString(2).padStart(13, "0");
        return encoded.slice(0, 12);
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
