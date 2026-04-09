import { InstructionDetector } from "./instructionDetector";
import { binaryToDecimal } from "./utils";
import { I_Instruction } from "./instructions/I_Instruction";
import { S_Instruction } from "./instructions/S_Instruction";
import { B_Instruction } from "./instructions/B_Instruction";
import { J_Instruction } from "./instructions/J_Instruction";

// ---------------------------------------------------------------------------
// Auxiliar: extrai campos de uma instrução detectada de forma segura.
// ---------------------------------------------------------------------------
function decodeHex(hex: string) {
    const detector = new InstructionDetector(hex);
    const binary = (detector as any).InstructionBinary as string;
    const instruction = InstructionDetector.detectInstruction(binary);
    return { instruction, binary };
}

// ---------------------------------------------------------------------------
// binaryToDecimal — Bug 1: conversão de imediatos deve ser com sinal (exceto
// campos de 5 bits que representam registradores).
// ---------------------------------------------------------------------------
describe("binaryToDecimal (utils)", () => {
    describe("campos de registrador (5 bits) — sem sinal", () => {
        test("01010 => 10 (x10 / a0)", () => {
            expect(binaryToDecimal("01010")).toBe(10);
        });

        test("11111 => 31 (x31)", () => {
            expect(binaryToDecimal("11111")).toBe(31);
        });

        test("00000 => 0 (x0)", () => {
            expect(binaryToDecimal("00000")).toBe(0);
        });
    });

    describe("imediatos (comprimento ≠ 5) — com sinal / complemento de 2", () => {
        test("000000000101 (12 bits) => 5", () => {
            expect(binaryToDecimal("000000000101")).toBe(5);
        });

        test("111111111111 (12 bits) => -1", () => {
            expect(binaryToDecimal("111111111111")).toBe(-1);
        });

        test("000000000100 (12 bits) => 4", () => {
            expect(binaryToDecimal("000000000100")).toBe(4);
        });

        test("111111111100 (12 bits) => -4", () => {
            expect(binaryToDecimal("111111111100")).toBe(-4);
        });

        test("0000000000100 (13 bits) => 4", () => {
            expect(binaryToDecimal("0000000000100")).toBe(4);
        });

        test("1111111111100 (13 bits) => -4", () => {
            expect(binaryToDecimal("1111111111100")).toBe(-4);
        });

        test("000000000000000000100 (21 bits) => 4", () => {
            expect(binaryToDecimal("000000000000000000100")).toBe(4);
        });

        test("111111111111111111100 (21 bits) => -4", () => {
            expect(binaryToDecimal("111111111111111111100")).toBe(-4);
        });
    });
});

// ---------------------------------------------------------------------------
// I-type — imediatos positivos e negativos
// Bug 1 verificado: imm deve ser interpretado com sinal (complemento de 2).
// ---------------------------------------------------------------------------
describe("I-type — extração de imediato", () => {
    // ADDI x5, x0, 5  =>  hex 00500293
    test("ADDI x5, x0, 5 — imediato positivo = 5", () => {
        const { instruction } = decodeHex("00500293");
        expect(instruction).toBeInstanceOf(I_Instruction);
        const ins = instruction as I_Instruction;
        expect(binaryToDecimal(ins.imm)).toBe(5);
        expect(ins.imm).toBe("000000000101");
    });

    // ADDI x5, x0, -1  =>  hex FFF00293
    // Bug 1: parseInt("111111111111", 2) dava 4095; binaryToDecimal dá -1.
    test("ADDI x5, x0, -1 — imediato negativo = -1 (complemento de 2)", () => {
        const { instruction } = decodeHex("FFF00293");
        expect(instruction).toBeInstanceOf(I_Instruction);
        const ins = instruction as I_Instruction;
        expect(ins.imm).toBe("111111111111");
        expect(binaryToDecimal(ins.imm)).toBe(-1);
        // Garante que a conversão sem sinal NÃO é usada
        expect(parseInt(ins.imm, 2)).toBe(4095);
    });

    // ADDI x5, x0, -4  =>  hex FFC00293
    test("ADDI x5, x0, -4 — imediato negativo = -4", () => {
        const { instruction } = decodeHex("FFC00293");
        expect(instruction).toBeInstanceOf(I_Instruction);
        const ins = instruction as I_Instruction;
        expect(binaryToDecimal(ins.imm)).toBe(-4);
    });

    test("ADDI x5, x0, -1 — rd = x5, rs1 = x0", () => {
        const { instruction } = decodeHex("FFF00293");
        const ins = instruction as I_Instruction;
        expect(binaryToDecimal(ins.rd)).toBe(5);
        expect(binaryToDecimal(ins.rs1)).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// S-type — Bug 2: slices de imediato corrigidos.
// imm[4:0] = slice(20,25) e imm[11:5] = slice(0,7) (era o contrário antes).
// ---------------------------------------------------------------------------
describe("S-type — extração de imediato (Bug 2 verificado)", () => {
    // SW x7, 4(x10)  =>  hex 00752223
    test("SW x7, 4(x10) — imediato positivo = 4", () => {
        const { instruction } = decodeHex("00752223");
        expect(instruction).toBeInstanceOf(S_Instruction);
        const ins = instruction as S_Instruction;
        // imm = imm[11:5] + imm[4:0] = "0000000" + "00100" = "000000000100"
        expect((ins as any).imm).toBe("000000000100");
        expect(binaryToDecimal((ins as any).imm)).toBe(4);
    });

    // SW x7, -4(x10)  =>  hex FE752E23
    test("SW x7, -4(x10) — imediato negativo = -4", () => {
        const { instruction } = decodeHex("FE752E23");
        expect(instruction).toBeInstanceOf(S_Instruction);
        const ins = instruction as S_Instruction;
        // imm = "1111111" + "11100" = "111111111100" = -4
        expect((ins as any).imm).toBe("111111111100");
        expect(binaryToDecimal((ins as any).imm)).toBe(-4);
    });

    test("SW x7, 4(x10) — rs1 = x10, rs2 = x7", () => {
        const { instruction } = decodeHex("00752223");
        const ins = instruction as S_Instruction;
        expect(binaryToDecimal((ins as any).rs1)).toBe(10);
        expect(binaryToDecimal((ins as any).rs2)).toBe(7);
    });
});

// ---------------------------------------------------------------------------
// B-type — Bug 3: rs2 e campos de imediato corrigidos.
// rs2 deve usar slice(7,12); imm[12] = bit31, imm[11] = bit7.
// ---------------------------------------------------------------------------
describe("B-type — extração de imediato e rs2 (Bug 3 verificado)", () => {
    // BEQ x10, x10, 4  =>  hex 00A50263
    test("BEQ x10, x10, 4 — imediato positivo = 4", () => {
        const { instruction } = decodeHex("00A50263");
        expect(instruction).toBeInstanceOf(B_Instruction);
        const ins = instruction as B_Instruction;
        // imm armazenado: imm[12|11|10:5|4:1] + "0"
        expect(binaryToDecimal((ins as any).imm)).toBe(4);
    });

    // BEQ x10, x10, -4  =>  hex FEA50EE3
    test("BEQ x10, x10, -4 — imediato negativo = -4", () => {
        const { instruction } = decodeHex("FEA50EE3");
        expect(instruction).toBeInstanceOf(B_Instruction);
        const ins = instruction as B_Instruction;
        expect(binaryToDecimal((ins as any).imm)).toBe(-4);
    });

    // Bug 3: rs2 estava errado (slice(15,20) em vez de slice(7,12))
    test("BEQ x10, x10, 4 — rs2 = x10 (não x16)", () => {
        const { instruction } = decodeHex("00A50263");
        const ins = instruction as B_Instruction;
        expect((ins as any).rs2).toBe("01010");
        expect(binaryToDecimal((ins as any).rs2)).toBe(10);
    });

    test("BEQ x10, x10, -4 — rs2 = x10 (não x16)", () => {
        const { instruction } = decodeHex("FEA50EE3");
        const ins = instruction as B_Instruction;
        expect((ins as any).rs2).toBe("01010");
        expect(binaryToDecimal((ins as any).rs2)).toBe(10);
    });

    test("BEQ x10, x10, 4 — rs1 = x10, funct3 = 000 (BEQ)", () => {
        const { instruction } = decodeHex("00A50263");
        const ins = instruction as B_Instruction;
        expect((ins as any).rs1).toBe("01010");
        expect((ins as any).funct3).toBe("000");
    });
});

// ---------------------------------------------------------------------------
// J-type — Bug 4: bits do imediato remontados na ordem correta.
// imm[20|19:12|11|10:1|0] — era imm[20|10:1|11|19:12] antes.
// ---------------------------------------------------------------------------
describe("J-type — extração de imediato (Bug 4 verificado)", () => {
    // JAL x1, 4  =>  hex 004000EF
    test("JAL x1, 4 — imediato positivo = 4", () => {
        const { instruction } = decodeHex("004000EF");
        expect(instruction).toBeInstanceOf(J_Instruction);
        const ins = instruction as J_Instruction;
        expect(binaryToDecimal((ins as any).imm)).toBe(4);
    });

    // JAL x1, -4  =>  hex FFDFF0EF
    test("JAL x1, -4 — imediato negativo = -4", () => {
        const { instruction } = decodeHex("FFDFF0EF");
        expect(instruction).toBeInstanceOf(J_Instruction);
        const ins = instruction as J_Instruction;
        expect(binaryToDecimal((ins as any).imm)).toBe(-4);
    });

    test("JAL x1, 4 — rd = x1", () => {
        const { instruction } = decodeHex("004000EF");
        const ins = instruction as J_Instruction;
        expect(binaryToDecimal((ins as any).rd)).toBe(1);
    });

    test("JAL x1, -4 — rd = x1", () => {
        const { instruction } = decodeHex("FFDFF0EF");
        const ins = instruction as J_Instruction;
        expect(binaryToDecimal((ins as any).rd)).toBe(1);
    });
});
