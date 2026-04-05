# RISC-V Instruction Detector

Um projeto TypeScript que detecta, valida e análisa instruções RISC-V, convertendo entre formatos hexadecimal e binário e identificando o tipo de instrução automaticamente.

## 📋 Visão Geral

Este projeto fornece uma solução completa para trabalhar com instruções do conjunto RISC-V (RISC-V RV32I). Ele é capaz de:

- **Converter** instruções entre formatos hexadecimal e binário (32 bits)
- **Detectar** automaticamente o tipo de instrução (R, I, S, B, U, J, SYSTEM)
- **Validar** opcodes e formatos de instrução
- **Extrair** campos individuais (rd, rs1, rs2, funct3, funct7, imm, etc)
- **Formatar** as instruções em strings legíveis

## 🏗️ Estrutura do Projeto

```
RISC-V/
├── src/
│   ├── instructions/           # Classes de cada tipo de instrução
│   │   ├── R_Instruction.ts    # Tipo R (registro para registro)
│   │   ├── I_Instruction.ts    # Tipo I (imediato)
│   │   ├── S_Instruction.ts    # Tipo S (store/armazena)
│   │   ├── B_Instruction.ts    # Tipo B (branch/condicional)
│   │   ├── U_Instruction.ts    # Tipo U (upper imediato)
│   │   ├── J_Instruction.ts    # Tipo J (jump/salto)
│   │   ├── SYSTEM_Instruction.ts # Tipo SYSTEM (ECALL, EBREAK)
│   │   └── index.ts            # Exports consolidados
│   ├── instructionDetector.ts  # Detector principal
│   ├── instructionsType.ts     # Tipos, enums e classe abstrata
│   ├── main.ts                 # Ponto de entrada
│   └── test.ts                 # Suite de testes
├── dist/                       # Compilado (JavaScript gerado)
├── input.txt                   # Arquivo de teste com 10 instruções
├── tsconfig.json               # Configuração TypeScript
├── package.json                # Dependências
└── readme.md                   # Este arquivo
```

## 🔧 Tipos de Instruções Suportadas

| Tipo | Formato | Exemplo | Descrição |
|------|---------|---------|-----------|
| **R** | `funct7[7] rs2[5] rs1[5] funct3[3] rd[5] opcode[7]` | ADD x1, x2, x3 | Operações entre registros |
| **I** | `imm[12] rs1[5] funct3[3] rd[5] opcode[7]` | ADDI x1, x2, 100 | Operações com imediato |
| **S** | `imm[12] rs2[5] rs1[5] funct3[3] imm[5] opcode[7]` | SW x1, 0(x2) | Store (escrever em memória) |
| **B** | `imm[1] imm[6] rs2[5] rs1[5] funct3[3] imm[4] imm[1] opcode[7]` | BEQ x1, x2, label | Branch condicional |
| **U** | `imm[20] rd[5] opcode[7]` | LUI x1, 0x12345 | Load upper imediato |
| **J** | `imm[1] imm[10] imm[1] imm[8] rd[5] opcode[7]` | JAL x1, label | Jump (salto incondicional) |
| **SYSTEM** | `funct12[12] rs1[5] funct3[3] rd[5] opcode[7]` | ECALL / EBREAK | Chamadas de sistema |

## 📦 Instalação

### Pré-requisitos
- Node.js (v14+)
- npm ou yarn

### Passos
```bash
# 1. Clonar/abrir o repositório
cd RISC-V

# 2. Instalar dependências
npm install

# 3. Compilar TypeScript
npx tsc
```

## 🚀 Como Usar

### Compilar o Projeto
```bash
npx tsc
```

### Rodar os Testes
```bash
# Executa a suite de testes com o arquivo input.txt
npx tsc && node dist/test.js
```

### Usar Programaticamente
```typescript
import { InstructionDetector } from "./instructionDetector";
import { InstructionOpcode } from "./instructionsType";

// Criar detector com instrução hexadecimal
const detector = new InstructionDetector("0FC10297");

// Detectar o tipo de instrução
const instruction = InstructionDetector.detectInstruction(detector.InstructionBinary);

// Exibir resultado formatado
console.log(instruction.formatedString());
// Output: Instruction of Type U with rd:00101 and imm:00001111110000010000
```

## � Scripts NPM Disponíveis

Este projeto oferece vários scripts npm para facilitar o desenvolvimento e o uso:

### `npm run build`
Compila todo o código TypeScript para JavaScript

```bash
npm run build
```

**O que faz:** Executa `tsc` e gera arquivos compilados na pasta `dist/`

---

### `npm test` ou `npm run dev`
Executa a suite de testes com o arquivo padrão `input.txt`

```bash
npm test
```

**O que faz:** 
- Compila o projeto
- Processa 10 instruções RISC-V de exemplo
- Exibe resultado formatado e contagem de sucessos/erros

---

### `npm run process`
Processa um arquivo de instruções hexadecimais com relatório detalhado

#### Uso Padrão (input.txt)
```bash
npm run process
```

#### Com Arquivo Customizado
```bash
npm run process -- seu-arquivo.txt
```

**Exemplos:**
```bash
# Processar arquivo padrão
npm run process

# Processar arquivo customizado
npm run process -- sample-input.txt

# Arquivo com caminho completo
npm run process -- "C:\meus-arquivos\instruções.txt"
```

**O que faz:**
- Lê instruções hexadecimais do arquivo
- Converte para binário automaticamente
- Detecta o tipo de instrução
- Exibe resultado formatado com emojis
- Mostra resumo com taxa de sucesso (100%)

**Exemplo de Saída:**
```
╔════════════════════════════════════════════════════════════════╗
║        RISC-V Instruction Detector - Processador de Arquivo     ║
╚════════════════════════════════════════════════════════════════╝

📄 Arquivo: C:\Users\Erick\RISC-V\input.txt
📊 Total de instruções: 10

──────────────────────────────────────────────────────────────────────

[  1] ✅ Successo
     Hexadecimal: 0FC10297
     Binário:     00001111110000010000001010010111
     Formato:     Instruction of Type U with rd:00101 and imm:00001111110000010000

[  2] ✅ Successo
     ...

──────────────────────────────────────────────────────────────────────

📈 Resumo:
   ✅ Sucesso: 10
   ❌ Erros:   0
   📊 Taxa:    100.0%
```

---

### Outros Scripts

| Script | Comando | Função |
|--------|---------|--------|
| **start** | `npm start` | Executa o programa principal |
| **clean** | `npm run clean` | Remove a pasta `dist/` |

Para mais detalhes sobre os scripts, consulte [SCRIPTS.md](SCRIPTS.md)

## �📝 Formato do Arquivo de Entrada

O arquivo `input.txt` contém instruções hexadecimais, uma por linha:

```
0fc10297
00028293
0002a303
00500513
006503b3
0072a023
00a50263
004000ef
00a00893
00000073
```

## ✅ Validação e Testes com IA

Este projeto foi desenvolvido com assistência de inteligência artificial para:

### 1. **Validação de Código**
   - Identificação e correção de bugs críticos no detector de instruções
   - Correção de typos e nomenclatura de classes
   - Refatoração de lógica de switch-case para suportar múltiplos opcodes
   - Validação de tipos TypeScript

### 2. **Correções Implementadas (com IA)**
   - **Bug no Construtor:** Corrigida a lógica de conversão hexadecimal/binário
   - **Switch Case:** Alterado de `case (A || B || C)` para múltiplos `case` individuais
   - **Índices RISC-V:** Corrigidos os índices de slice para corresponder ao layout correto de bits
   - **Herança de Classes:** Resolvido conflito entre propriedades privadas na herança

### 3. **Testes e Validação**
   - Criação da suite de testes (`src/test.ts`)
   - Validação de 10 instruções de exemplo
   - Testes de conversão hex ↔ binário
   - Verificação de detecção correta de tipos
   - **Status:** ✅ 10/10 instruções de teste passaram

### Resultado dos Testes
```
=== RISC-V Instruction Detector Test ===

Processing 10 instructions from ./input.txt

[1] Hex: 0FC10297 → U-Type ✅
[2] Hex: 00028293 → I-Type ✅
[3] Hex: 0002A303 → I-Type ✅
[4] Hex: 00500513 → I-Type ✅
[5] Hex: 006503B3 → R-Type ✅
[6] Hex: 0072A023 → S-Type ✅
[7] Hex: 00A50263 → B-Type ✅
[8] Hex: 004000EF → J-Type ✅
[9] Hex: 00A00893 → I-Type ✅
[10] Hex: 00000073 → SYSTEM-Type ✅

=== Test Complete ===
```

## 🔍 Principais Classes

### `InstructionDetector`
Classe responsável por:
- Converter hexadecimal ↔ binário
- Detectar o tipo de instrução baseado no opcode
- Instanciar a classe apropriada para cada tipo

### `Instruction` (Abstrata)
Classe base para todas as instruções com:
- Validação de opcode
- Método abstrato `formatedString()`
- Encapsulamento de dados

### Classes de Tipos
- `R_Instruction`: Operações entre registros
- `I_Instruction`: Operações com imediato
- `S_Instruction`: Store (armazenamento)
- `B_Instruction`: Branch (condicional)
- `U_Instruction`: Upper imediato
- `J_Instruction`: Jump
- `SYSTEM_Instruction`: Chamadas de sistema

## 📚 Referências

- [RISC-V Instruction Set Explanation](https://fraserinnovations.com/risc-v/risc-v-instruction-set-explanation/)
- [RISC-V Oficial](https://riscv.org/)
- [RV32I Specification](https://riscv.org/specifications/)

## 🛠️ Desenvolvimento

### Tecnologias Utilizadas
- **TypeScript** - Tipagem estática e segurança
- **Node.js** - Runtime JavaScript
- **Git** - Controle de versão

### Comandos Úteis
```bash
# Compilar
npm run build: npx tsc

# Executar testes
npm run test: npx tsc && node dist/test.js

# Limpar arquivos compilados
npm run clean: rm -rf dist/
```

## 📄 Licença

Este projeto é fornecido como está para fins educacionais.

## 👨‍💻 Desenvolvimento

Desenvolvido com assistência de IA para garantir:
- ✅ Correção de bugs críticos
- ✅ Validação de tipos TypeScript
- ✅ Implementação e testes de suite
- ✅ Documentação completa