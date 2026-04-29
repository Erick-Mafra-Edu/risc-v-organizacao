import { InstructionDetector } from "./instructionDetector";
import { InstructionOpcode } from "./instructionsType";

describe("RISC-V Instruction Detector", () => {
    describe("Hex to Binary Conversion", () => {
        test("should convert hex 0FC10297 to correct binary", () => {
            const detector = new InstructionDetector("0FC10297");
            expect((detector as any).InstructionBinary).toBe("00001111110000010000001010010111");
        });

        test("should convert hex 00028293 to correct binary", () => {
            const detector = new InstructionDetector("00028293");
            expect((detector as any).InstructionBinary).toBe("00000000000000101000001010010011");
        });

        test("should convert hex 0002A303 to correct binary", () => {
            const detector = new InstructionDetector("0002A303");
            expect((detector as any).InstructionBinary).toBe("00000000000000101010001100000011");
        });

        test("should handle case-insensitive hex input", () => {
            const detector1 = new InstructionDetector("0FC10297");
            const detector2 = new InstructionDetector("0fc10297");
            expect((detector1 as any).InstructionBinary).toBe((detector2 as any).InstructionBinary);
        });
    });

    describe("Instruction Type Detection", () => {
        test("should detect U-Type instruction (LUI)", () => {
            const detector = new InstructionDetector("0FC10297");
            const instruction = detector.detectInstruction();
            expect(instruction.formatedString()).toContain("Type U");
        });

        test("should detect I-Type instruction (ADDI)", () => {
            const detector = new InstructionDetector("00028293");
            const instruction = detector.detectInstruction();
            expect(instruction.formatedString()).toContain("Type I");
        });

        test("should detect I-Type instruction (LW)", () => {
            const detector = new InstructionDetector("0002A303");
            const instruction = detector.detectInstruction();
            expect(instruction.formatedString()).toContain("Type I");
        });

        test("should detect R-Type instruction (ADD)", () => {
            const detector = new InstructionDetector("006503B3");
            const instruction = detector.detectInstruction();
            expect(instruction.formatedString()).toContain("Type R");
        });

        test("should detect S-Type instruction (SW)", () => {
            const detector = new InstructionDetector("0072A023");
            const instruction = detector.detectInstruction();
            expect(instruction.formatedString()).toContain("Type S");
        });

        test("should detect B-Type instruction (BEQ)", () => {
            const detector = new InstructionDetector("00A50263");
            const instruction = detector.detectInstruction();
            expect(instruction.formatedString()).toContain("Type B");
            expect(instruction.formatedString()).toContain("rs1:01010");
            expect(instruction.formatedString()).toContain("rs2:01010");
            expect(instruction.formatedString()).toContain("imm:0000000000100");
        });

        test("should detect J-Type instruction (JAL)", () => {
            const detector = new InstructionDetector("004000EF");
            const instruction = detector.detectInstruction();
            expect(instruction.formatedString()).toContain("Type J");
            expect(instruction.formatedString()).toContain("rd:00001");
            expect(instruction.formatedString()).toContain("imm:000000000000000000100");
        });

        test("should detect SYSTEM-Type instruction (ECALL)", () => {
            const detector = new InstructionDetector("00000073");
            const instruction = detector.detectInstruction();
            expect(instruction.formatedString()).toContain("Type SYSTEM");
        });
    });

    describe("Complete Instruction Test Cases", () => {
        const testCases = [
            {
                hex: "0FC10297",
                type: "U",
                binary: "00001111110000010000001010010111",
                description: "LUI - Load Upper Immediate"
            },
            {
                hex: "00028293",
                type: "I",
                binary: "00000000000000101000001010010011",
                description: "ADDI - Add Immediate"
            },
            {
                hex: "0002A303",
                type: "I",
                binary: "00000000000000101010001100000011",
                description: "LW - Load Word"
            },
            {
                hex: "00500513",
                type: "I",
                binary: "00000000010100000000010100010011",
                description: "ADDI - Add Immediate with offset"
            },
            {
                hex: "006503B3",
                type: "R",
                binary: "00000000011001010000001110110011",
                description: "ADD - Add Register"
            },
            {
                hex: "0072A023",
                type: "S",
                binary: "00000000011100101010000000100011",
                description: "SW - Store Word"
            },
            {
                hex: "00A50263",
                type: "B",
                binary: "00000000101001010000001001100011",
                description: "BEQ - Branch if Equal"
            },
            {
                hex: "004000EF",
                type: "J",
                binary: "00000000010000000000000011101111",
                description: "JAL - Jump and Link"
            },
            {
                hex: "00A00893",
                type: "I",
                binary: "00000000101000000000100010010011",
                description: "ADDI - Add Immediate"
            },
            {
                hex: "00000073",
                type: "SYSTEM",
                binary: "00000000000000000000000001110011",
                description: "ECALL - Environment Call"
            }
        ];

        testCases.forEach((testCase) => {
            test(`should correctly process ${testCase.description}`, () => {
                const detector = new InstructionDetector(testCase.hex);
                const instruction = detector.detectInstruction();

                // Confere a conversao para binario.
                expect((detector as any).InstructionBinary).toBe(testCase.binary);

                // Confere se o tipo detectado bate com o esperado.
                expect(instruction.formatedString()).toContain(`Type ${testCase.type}`);

                // Garante que a string formatada nao esta vazia.
                expect(instruction.formatedString().length).toBeGreaterThan(0);
            });
        });
    });

    describe("Error Handling", () => {
        test("should throw error for invalid hex length", () => {
            expect(() => {
                new InstructionDetector("12345");
            }).toThrow();
        });

        test("should throw error for unrecognized opcode", () => {
            expect(() => {
                const binary = "11111111111111111111111111111111";
                const detector = new InstructionDetector("00000000");
                detector.detectInstruction(binary);
            }).toThrow();
        });
    });
});
