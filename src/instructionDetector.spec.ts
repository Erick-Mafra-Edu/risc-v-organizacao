import { InstructionDetector } from "./instructionDetector";
import { InstructionOpcode } from "./instructionsType";
import { formatDisplayInDecimal, binaryToDecimal } from "./utils";

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
            const instruction = InstructionDetector.detectInstruction((detector as any).InstructionBinary);
            expect(instruction.formatedString()).toContain("Type U");
        });

        test("should detect I-Type instruction (ADDI)", () => {
            const detector = new InstructionDetector("00028293");
            const instruction = InstructionDetector.detectInstruction((detector as any).InstructionBinary);
            expect(instruction.formatedString()).toContain("Type I");
        });

        test("should detect I-Type instruction (LW)", () => {
            const detector = new InstructionDetector("0002A303");
            const instruction = InstructionDetector.detectInstruction((detector as any).InstructionBinary);
            expect(instruction.formatedString()).toContain("Type I");
        });

        test("should detect R-Type instruction (ADD)", () => {
            const detector = new InstructionDetector("006503B3");
            const instruction = InstructionDetector.detectInstruction((detector as any).InstructionBinary);
            expect(instruction.formatedString()).toContain("Type R");
        });

        test("should detect S-Type instruction (SW)", () => {
            const detector = new InstructionDetector("0072A023");
            const instruction = InstructionDetector.detectInstruction((detector as any).InstructionBinary);
            expect(instruction.formatedString()).toContain("Type S");
        });

        test("should detect B-Type instruction (BEQ)", () => {
            const detector = new InstructionDetector("00A50263");
            const instruction = InstructionDetector.detectInstruction((detector as any).InstructionBinary);
            expect(instruction.formatedString()).toContain("Type B");
        });

        test("should detect J-Type instruction (JAL)", () => {
            const detector = new InstructionDetector("004000EF");
            const instruction = InstructionDetector.detectInstruction((detector as any).InstructionBinary);
            expect(instruction.formatedString()).toContain("Type J");
        });

        test("should detect SYSTEM-Type instruction (ECALL)", () => {
            const detector = new InstructionDetector("00000073");
            const instruction = InstructionDetector.detectInstruction((detector as any).InstructionBinary);
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
                const instruction = InstructionDetector.detectInstruction((detector as any).InstructionBinary);

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
                InstructionDetector.detectInstruction(binary);
            }).toThrow();
        });
    });

    describe("Decimal Conversion - formatDisplayInDecimal", () => {
        test("should convert 5-bit register field as unsigned (0-31)", () => {
            expect(formatDisplayInDecimal("rd:00111")).toBe("rd:7");
            expect(formatDisplayInDecimal("rs1:11111")).toBe("rs1:31");
            expect(formatDisplayInDecimal("rs2:10000")).toBe("rs2:16");
        });

        test("should convert positive immediate as positive decimal", () => {
            expect(formatDisplayInDecimal("imm:000000000101")).toBe("imm:5");
            expect(formatDisplayInDecimal("imm:000000001010")).toBe("imm:10");
        });

        test("should convert negative immediate using complemento de 2", () => {
            // 12-bit -1 = 111111111111
            expect(formatDisplayInDecimal("imm:111111111111")).toBe("imm:-1");
            // 12-bit -4 = 111111111100
            expect(formatDisplayInDecimal("imm:111111111100")).toBe("imm:-4");
        });

        test("should not convert non-binary tokens", () => {
            expect(formatDisplayInDecimal("Type R")).toBe("Type R");
            expect(formatDisplayInDecimal("Instruction of Type I")).toBe("Instruction of Type I");
        });

        test("should preserve separator characters", () => {
            expect(formatDisplayInDecimal("rd:00001 and imm:000000000101")).toBe("rd:1 and imm:5");
        });
    });

    describe("Decimal Conversion - binaryToDecimal", () => {
        test("should treat 5-bit fields as unsigned registers", () => {
            expect(binaryToDecimal("00000")).toBe(0);
            expect(binaryToDecimal("00101")).toBe(5);
            expect(binaryToDecimal("10000")).toBe(16);
            expect(binaryToDecimal("11111")).toBe(31);
        });

        test("should apply two's complement to immediates (non-5-bit)", () => {
            // 12-bit positivos
            expect(binaryToDecimal("000000000000")).toBe(0);
            expect(binaryToDecimal("000000000101")).toBe(5);
            // 12-bit negativos
            expect(binaryToDecimal("111111111111")).toBe(-1);
            expect(binaryToDecimal("111111111100")).toBe(-4);
            // 13-bit (B-type)
            expect(binaryToDecimal("0000000000100")).toBe(4);
            expect(binaryToDecimal("1111111111100")).toBe(-4);
            // 21-bit (J-type)
            expect(binaryToDecimal("000000000000000000100")).toBe(4);
            expect(binaryToDecimal("111111111111111111100")).toBe(-4);
        });
    });

    describe("Decimal Field Conversion - por tipo de instrucao", () => {
        const getDecimal = (hex: string) => {
            const detector = new InstructionDetector(hex);
            const instruction = InstructionDetector.detectInstruction((detector as any).InstructionBinary);
            return formatDisplayInDecimal(instruction.formatedString());
        };

        describe("I-Type", () => {
            test("ADDI x5, x5, 0 (00028293) - imm zero, registradores corretos", () => {
                const dec = getDecimal("00028293");
                expect(dec).toContain("rd:5");
                expect(dec).toContain("rs1:5");
                expect(dec).toContain("imm:0");
            });

            test("ADDI x10, x0, 5 (00500513) - imm positivo", () => {
                const dec = getDecimal("00500513");
                expect(dec).toContain("rd:10");
                expect(dec).toContain("rs1:0");
                expect(dec).toContain("imm:5");
            });

            test("ADDI x17, x0, 10 (00A00893) - imm positivo maior", () => {
                const dec = getDecimal("00A00893");
                expect(dec).toContain("rd:17");
                expect(dec).toContain("rs1:0");
                expect(dec).toContain("imm:10");
            });

            test("ADDI x1, x0, -1 (FFF00093) - imm negativo", () => {
                const dec = getDecimal("FFF00093");
                expect(dec).toContain("rd:1");
                expect(dec).toContain("rs1:0");
                expect(dec).toContain("imm:-1");
            });
        });

        describe("R-Type", () => {
            test("ADD x7, x10, x6 (006503B3) - registradores corretos", () => {
                const dec = getDecimal("006503B3");
                expect(dec).toContain("rd:7");
                expect(dec).toContain("rs1:10");
                expect(dec).toContain("rs2:6");
            });
        });

        describe("S-Type", () => {
            test("SW x7, 0(x5) (0072A023) - imm zero", () => {
                const dec = getDecimal("0072A023");
                expect(dec).toContain("rs1:5");
                expect(dec).toContain("rs2:7");
                expect(dec).toContain("imm:0");
            });

            test("SW x7, -4(x5) (FE72AE23) - imm negativo", () => {
                const dec = getDecimal("FE72AE23");
                expect(dec).toContain("rs1:5");
                expect(dec).toContain("rs2:7");
                expect(dec).toContain("imm:-4");
            });
        });

        describe("B-Type", () => {
            test("BEQ x10, x10, 4 (00A50263) - imm positivo", () => {
                const dec = getDecimal("00A50263");
                expect(dec).toContain("rs1:10");
                expect(dec).toContain("rs2:10");
                expect(dec).toContain("imm:4");
            });

            test("BEQ x0, x0, -4 (FE000EE3) - imm negativo", () => {
                const dec = getDecimal("FE000EE3");
                expect(dec).toContain("rs1:0");
                expect(dec).toContain("rs2:0");
                expect(dec).toContain("imm:-4");
            });
        });

        describe("J-Type", () => {
            test("JAL x1, 4 (004000EF) - imm positivo", () => {
                const dec = getDecimal("004000EF");
                expect(dec).toContain("rd:1");
                expect(dec).toContain("imm:4");
            });

            test("JAL x0, -4 (FFDFF06F) - imm negativo", () => {
                const dec = getDecimal("FFDFF06F");
                expect(dec).toContain("rd:0");
                expect(dec).toContain("imm:-4");
            });
        });

        describe("U-Type", () => {
            test("AUIPC x5, 64528 (0FC10297) - imm positivo de 20 bits", () => {
                const dec = getDecimal("0FC10297");
                expect(dec).toContain("rd:5");
                expect(dec).toContain("imm:64528");
            });
        });
    });
});
