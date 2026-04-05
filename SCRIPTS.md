# Scripts NPM

Este documento descreve os scripts disponíveis no projeto RISC-V Instruction Detector.

## Scripts Disponíveis

### `npm run build`
**Descrição:** Compila todo o código TypeScript para JavaScript

```bash
npm run build
```

**O que faz:**
- Executa `tsc` (TypeScript Compiler)
- Gera arquivos `.js`, `.d.ts` e `.map` na pasta `dist/`
- Leva alguns segundos na primeira execução

---

### `npm test` ou `npm run dev`
**Descrição:** Executa a suite de testes com o arquivo padrão `input.txt`

```bash
npm test
```

**O que faz:**
- Compila o projeto
- Executa o arquivo de teste (`dist/test.js`)
- Processa 10 instruções RISC-V de exemplo
- Exibe resultado formatado e contagem de sucessos/erros

**Exemplo de Saída:**
```
=== RISC-V Instruction Detector Test ===

Processing 10 instructions from ./input.txt

[1] Hex: 0FC10297
    Binary: 00001111110000010000001010010111
    Formatted: Instruction of Type U with rd:00101 and imm:00001111110000010000

[2] Hex: 00028293
    ...

=== Test Complete ===
```

---

### `npm run process`
**Descrição:** Processa um arquivo de instruções hexadecimais

#### Uso Padrão (input.txt)
```bash
npm run process
```

#### Com Arquivo Customizado
```bash
npm run process -- <caminho-do-arquivo>
```

**Exemplos:**
```bash
# Processar input.txt (padrão)
npm run process

# Processar arquivo customizado
npm run process -- sample-input.txt

# Caminho absoluto
npm run process -- "C:\meus-arquivos\minhas-instruções.txt"
```

**O que faz:**
- Lê as instruções hexadecimais do arquivo
- Converte para binário
- Detecta o tipo de instrução
- Exibe resultado formatado com cores e emojis
- Mostra resumo final com taxa de sucesso

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

### `npm start`
**Descrição:** Executa o arquivo principal da aplicação

```bash
npm start
```

**O que faz:**
- Ativa a compilação
- Executa `dist/main.js` (ponto de entrada do programa)

---

### `npm run clean`
**Descrição:** Remove os arquivos compilados da pasta `dist/`

```bash
npm run clean
```

**O que faz:**
- Deleta a pasta `dist/` inteira
- Limpa o workspace de arquivos intermediários
- Útil antes de fazer uma compilação limpa

---

## Formatos de Arquivo Aceitos

Os scripts aceitam arquivos com instruções hexadecimais no seguinte formato:

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

**Requisitos:**
- Uma instrução por linha
- Formato hexadecimal (8 caracteres)
- Case insensitive (maiúsculas ou minúsculas)
- Linhas em branco são ignoradas

---

## Fluxo de Desenvolvimento Recomendado

### 1º - Compilar o Projeto
```bash
npm run build
```

### 2º - Executar Testes
```bash
npm test
```

### 3º - Processar Arquivo Customizado
```bash
npm run process -- seu-arquivo.txt
```

### 4º - Iniciar Aplicação
```bash
npm start
```

### 5º - Limpar (Opcional)
```bash
npm run clean
```

---

## Exemplos de Uso

### Exemplo 1: Testar Instrução Única
Crie um arquivo `single.txt`:
```
0fc10297
```

Execute:
```bash
npm run process -- single.txt
```

### Exemplo 2: Testar Múltiplas Instruções
Crie um arquivo `batch.txt`:
```
0fc10297
00028293
0002a303
00500513
```

Execute:
```bash
npm run process -- batch.txt
```

### Exemplo 3: Executar Testes Padrão Repetidamente
```bash
npm test
```

---

## Troubleshooting

### ❌ Erro: "Cannot find module 'typescript'"
**Solução:**
```bash
npm install --save-dev typescript @types/node
```

### ❌ Erro: "Arquivo não encontrado"
**Solução:**
- Verifique se o caminho do arquivo está correto
- Use caminhos relativos ao diretório raiz do projeto

### ❌ Erro: "Opcode not recognized"
**Solução:**
- Verifique se as instruções são hexadecimais válidas
- Confirme que têm exatamente 8 caracteres

---

## Informações Técnicas

- **Compilador:** TypeScript → JavaScript (ES2020)
- **Runtime:** Node.js v14+
- **Módulo:** CommonJS
- **Saída:** Pasta `dist/`
