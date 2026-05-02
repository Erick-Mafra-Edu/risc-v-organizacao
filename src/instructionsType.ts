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

class Register {
    public ABIName: string;
    public binary:string;

    constructor(binary: string) {
        this.binary = binary;
        this.ABIName = this.getABIName(Number.parseInt(binary, 2));
    }
    public getABIName(index: number): string {
        // 1. Casos Únicos (Especiais)
        if (index === 0) return "zero";
        if (index === 1) return "ra";
        if (index === 2) return "sp";
        if (index === 3) return "gp";
        if (index === 4) return "tp";

        // 2. Temporários (t0 - t2) -> x5 a x7
        if (index >= 5 && index <= 7) return `t${index - 5}`;

        // 3. Salvos (s0 - s1) -> x8 a x9 (Nota: s0 também é chamado de fp)
        if (index >= 8 && index <= 9) return `s${index - 8}`;

        // 4. Argumentos (a0 - a7) -> x10 a x17
        if (index >= 10 && index <= 17) return `a${index - 10}`;

        // 5. Salvos (s2 - s11) -> x18 a x27
        if (index >= 18 && index <= 27) return `s${index - 16}`;

        // 6. Temporários (t3 - t6) -> x28 a x31
        if (index >= 28 && index <= 31) return `t${index - 25}`;

        return `unknown(x${index})`;
    }
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
export { InstructionOpcode, Instruction, Register };
