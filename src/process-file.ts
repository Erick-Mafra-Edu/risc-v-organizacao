import * as fs from "fs";
import * as path from "path";
import { InstructionDetector } from "./instructionDetector";

const parseBinaryValue = (binary: string, signed: boolean): number => {
    const value = parseInt(binary, 2);

    if (!signed) {
        return value;
    }

    return (value << (32 - binary.length)) >> (32 - binary.length);
};

const formatDisplayInDecimal = (formattedInstruction: string): string => {
    let resultado = "";
    let atual = "";
    let campo = "";

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
            if (isBinary(atual)) {
                const campoImediato = campo === "imm";
                resultado += parseBinaryValue(atual, campoImediato).toString(10);
            } else {
                resultado += atual;
                if (char === ":") {
                    campo = atual;
                }
            }

            resultado += char;
            atual = "";
        } else {
            atual += char;
        }
    }

    if (atual.length > 0) {
        if (isBinary(atual)) {
            const campoImediato = campo === "imm";
            resultado += parseBinaryValue(atual, campoImediato).toString(10);
        } else {
            resultado += atual;
        }
    }

    return resultado;
};

const processInstructionFile = (filePath: string): void => {
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
            console.log(`     Formato binario:     ${instruction.formatedString()}`);
            console.log(`     Formato decimal:     ${formatDisplayInDecimal(instruction.formatedString())}\n`);

            successCount++;
        } catch (error) {
            errorCount++;
            console.error(`\n[${String(index + 1).padStart(3)}] Erro`);
            console.error(`     Mensagem: ${(error as Error).message}`);
        }
    });

    void successCount;
    void errorCount;
};

if (require.main === module) {
    // Pega o caminho do arquivo passado por argumento.
    const args = process.argv.slice(2);
    const filePath = args[0] || "./input.txt";
    processInstructionFile(filePath);
}

export { formatDisplayInDecimal, processInstructionFile };
