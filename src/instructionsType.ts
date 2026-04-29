enum InstructionOpcode {
    R_Type = "0110011",
    /**
     * Imediato de load.
     */
    IL_Type = "0000011",
    /**
     * Imediato de JALR.
     */
    JALR_Type = "1100111",
    /**
     * IAL == Aritmetica/Logica.
     */
    IAL_Type = "0010011",
    S_Type = "0100011",
    B_Type = "1100011",
    ULUI_Type = "0110111",
    UAUIPC_Type = "0010111",
    J_Type = "1101111",
    SYSTEM_Type = "1110011"
}

abstract class Instruction {
    protected opcode: InstructionOpcode | null;
    public abstract formatedString(): string;

    constructor(opcode: InstructionOpcode | string) {
        // Se vier string, tenta converter para um valor válido.
        if (typeof opcode === "string") {
            const enumValue = Object.values(InstructionOpcode).find(value => value === opcode);
            if (!enumValue) {
                throw new Error("Opcode Invalid");
            }
            this.opcode = enumValue as InstructionOpcode;
        } else {
            // Se ja vier enum, usa direto.
            this.opcode = opcode;
        }
    }
    public getType(): string {
        switch (this.opcode) {
            case InstructionOpcode.R_Type:
            case InstructionOpcode.IAL_Type:
                return "ALU";

            case InstructionOpcode.IL_Type:
                return "LOAD";

            case InstructionOpcode.S_Type:
                return "STORE";

            case InstructionOpcode.B_Type:
                return "BRANCH";

            case InstructionOpcode.J_Type:
            case InstructionOpcode.JALR_Type:
                return "JUMP";

            default:
                return "OTHER";
        }
    }
    public abstract reads(): string[] | null;
    public abstract writes(): string[] | null;
}

export default InstructionOpcode;
export { InstructionOpcode, Instruction };
