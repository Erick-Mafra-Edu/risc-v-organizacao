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
    public getImmediate(): string {
        return this.imm;
    }
    public getImmediateValue(): number {
        const value = parseInt(this.imm, 2);
        return (value << (32 - this.imm.length)) >> (32 - this.imm.length);
    }
    public withImmediateValue(offsetBytes: number): J_Instruction {
        return new J_Instruction(
            InstructionOpcode.J_Type,
            this.rd.binary,
            J_Instruction.encodeImmediate(offsetBytes)
        );
    }
    private static encodeImmediate(offsetBytes: number): string {
        if (offsetBytes % 2 !== 0) {
            throw new Error("J-Type immediate must be aligned to 2 bytes");
        }
        if (offsetBytes < -1048576 || offsetBytes > 1048574) {
            throw new Error("J-Type immediate out of range");
        }

        const encoded = (offsetBytes & 0x1fffff).toString(2).padStart(21, "0");
        return encoded.slice(0, 20);
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
