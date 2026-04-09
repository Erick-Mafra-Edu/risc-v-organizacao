/**
 * Converte uma string binária para um número decimal com sinal (complemento de 2),
 * exceto para campos de exatamente 5 bits (registradores rd, rs1, rs2), que são
 * tratados como sem sinal.
 *
 * @param binary - String de 0s e 1s representando o campo binário.
 * @returns O valor decimal correspondente.
 */
export function binaryToDecimal(binary: string): number {
    const len = binary.length;

    if (len === 5) {
        // Campos de registrador (5 bits): sempre sem sinal.
        return parseInt(binary, 2);
    }

    // Imediatos: aplica complemento de 2 se o bit de sinal (MSB) for 1.
    const unsigned = parseInt(binary, 2);
    if (binary[0] === "1") {
        return unsigned - (1 << len);
    }
    return unsigned;
}
