import * as fs from "fs";
import * as path from "path";
import { InstructionDetector } from "./instructionDetector";

const formatDisplayInDecimal = (formattedInstruction: string): string => {
    let result = "";
    let current = "";

    const isBinary = (str: string) => {
        if (str.length < 2) return false;
        for (let i = 0; i < str.length; i++) {
            if (str[i] !== "0" && str[i] !== "1") return false;
        }
        return true;
    };

    for (let i = 0; i < formattedInstruction.length; i++) {
        const char = formattedInstruction[i];

        // Quando encontra um separador (espaco, dois-pontos, virgula etc.)
        if (" :,()[]{}".includes(char)) {
            if (isBinary(current)) {
                result += parseInt(current, 2).toString(10);
            } else {
                result += current;
            }

            result += char;
            current = "";
        } else {
            current += char;
        }
    }

    if (current.length > 0) {
        if (isBinary(current)) {
            result += parseInt(current, 2).toString(10);
        } else {
            result += current;
        }
    }

    return result;
};

// Pega o caminho do arquivo passado por argumento.
const args = process.argv.slice(2);
const filePath = args[0] || "./input.txt";

// Verifica se o arquivo existe antes de continuar.
if (!fs.existsSync(filePath)) {
    console.error(` Erro: Arquivo '${filePath}' nao encontrado`);
    process.exit(1);
}

// Le o arquivo e separa em linhas validas.
const fileContent = fs.readFileSync(filePath, "utf-8");
const instructions = fileContent.trim().split("\n").filter(line => line.trim());

console.log("===================================================================");
console.log("|        RISC-V Instruction Detector - Processador de Arquivo    |");
console.log("===================================================================\n");

console.log(` Arquivo: ${path.resolve(filePath)}`);
console.log(` Total de instrucoes: ${instructions.length}\n`);
console.log("-".repeat(70));

let successCount = 0;
let errorCount = 0;

instructions.forEach((hexInstruction: string, index: number) => {
    try {
        const trimmedHex = hexInstruction.trim();

        if (!trimmedHex) return;

        // Cria o detector para essa linha.
        const detector = new InstructionDetector(trimmedHex);

        // Detecta o tipo da instrucao a partir do binario.
        const instruction = InstructionDetector.detectInstruction((detector as any).InstructionBinary);

        console.log(`\n[${String(index + 1).padStart(3)}] Successo`);
        console.log(`     Hexadecimal: ${trimmedHex.toUpperCase()}`);
        // console.log(`     Binario:     ${(detector as any).InstructionBinary}`);
        // console.log(`     Decimal:     ${parseInt((detector as any).InstructionBinary, 2)}`);
        console.log(`     Formato binario:     ${instruction.formatedString()}`);
        console.log(`     Formato decimal:     ${formatDisplayInDecimal(instruction.formatedString())}\n`);

        successCount++;
    } catch (error) {
        errorCount++;
        console.error(`\n[${String(index + 1).padStart(3)}] Erro`);
        // console.error(`     Hex:      ${hexInstruction.trim()}`);
        console.error(`     Mensagem: ${(error as Error).message}`);
    }
});

// console.log("\n" + "-".repeat(70));
// console.log(`\n Resumo:`);
// console.log(`    Sucesso: ${successCount}`);
// console.log(`    Erros:   ${errorCount}`);
// console.log(`    Taxa:    ${((successCount / (successCount + errorCount)) * 100).toFixed(1)}%\n`);
