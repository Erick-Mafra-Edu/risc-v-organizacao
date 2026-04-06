/**
 * Verifica se uma string representa um valor binário (apenas 0s e 1s).
 */
const isBinary = (str: string): boolean => {
    if (str.length < 1) return false;
    for (let i = 0; i < str.length; i++) {
        if (str[i] !== "0" && str[i] !== "1") return false;
    }
    return true;
};

/**
 * Converte uma string binária para decimal, aplicando complemento de 2
 * para campos com comprimento diferente de 5 bits (imediatos).
 * Campos de exatamente 5 bits são tratados como registradores sem sinal (0-31).
 */
export const binaryToDecimal = (binary: string): number => {
    if (binary.length === 5) {
        // Registradores (rd, rs1, rs2) são sempre sem sinal.
        return parseInt(binary, 2);
    }
    // Imediatos: aplica complemento de 2 se o bit de sinal estiver setado.
    const unsigned = parseInt(binary, 2);
    if (binary[0] === "1") {
        return unsigned - (1 << binary.length);
    }
    return unsigned;
};

/**
 * Converte todos os campos binários presentes na string formatada de uma instrução
 * para seus equivalentes decimais. Imediatos com sinal são exibidos como negativos
 * quando necessário; registradores (5 bits) são sempre sem sinal.
 */
export const formatDisplayInDecimal = (formattedInstruction: string): string => {
    let result = "";
    let current = "";

    for (let i = 0; i < formattedInstruction.length; i++) {
        const char = formattedInstruction[i];

        // Quando encontra um separador (espaco, dois-pontos, virgula etc.)
        if (" :,()[]{}".includes(char)) {
            if (isBinary(current)) {
                result += binaryToDecimal(current).toString(10);
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
            result += binaryToDecimal(current).toString(10);
        } else {
            result += current;
        }
    }

    return result;
};
