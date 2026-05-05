# ✅ RISC-V Pipeline Simulator - Checklist

## 📥 Parser / Entrada
- [x] Ler arquivo de instruções (HEX/BIN)
- [x] Converter para objetos de instrução

## 🧠 Decodificação
- [x] Identificar opcode
- [x] Classificar tipo (ALU, LOAD, STORE, BRANCH, JUMP)
- [x] Implementar `reads()`
- [x] Implementar `writes()`
- [x] Implementar `getMnemonic()` para todas as instruções (Assembly format)

## 🔍 Detecção de Conflitos

### Dados
- [x] Detectar RAW
- [x] Detectar LOAD hazard
- [ ] Detectar WAW (função existe, não integrada no loop principal)
- [ ] Detectar WAR (função existe, não integrada no loop principal)

### Controle
- [x] Detectar BRANCH
- [x] Detectar JUMP

### Modos de Pipeline
- [x] Sem forwarding (CLASSIC)
- [x] Com forwarding (FORWARDING)

---

## 🧱 Resolução de Conflitos

### Dados
- [x] Inserir NOPs (sem forwarding)
- [x] Inserir NOPs (com forwarding)

### Controle
- [x] Inserir NOPs para branch/jump

---

## 🔄 Integração
- [x] Criar função única de análise completa (dados + controle)
- [x] Unificar saída (original + conflitos + resolvido)

---

## 📍 Recalcular Endereços (IMPORTANTE)
- [ ] Mapear índices antigos → novos
- [ ] Recalcular imediato de BRANCH
- [ ] Recalcular imediato de JUMP

---

## 📊 Estatísticas e Simulação
- [x] Contar instruções originais
- [x] Contar instruções após NOPs
- [x] Calcular sobrecusto (NOPs inseridos)
- [x] Comparar CLASSIC vs FORWARDING
- [x] **Simulador Expandido:** Execução completa de instruções ALU, Load, Store, Branch e Jump.
- [x] **Simulação de Hazards:** Implementação de atraso de escrita (PIPELINE mode) para demonstrar erros sem NOPs e correção com NOPs.
- [x] **Beautify Output:** Formatação em estilo assembly e tabelas de estado final.

---

## 🌐 Interface Web
- [x] Input de instruções
- [x] Exibir instruções parseadas
- [x] Mostrar conflitos
- [x] Mostrar resolução com NOPs
- [x] Exibir comparação entre modos
- [x] Exibir detalhes de cada hazard

---

## 📝 Relatório (para entrega)
- [ ] Tabela de conflitos detectados
- [ ] Explicação dos hazards
- [x] Comparação sem vs com forwarding
- [x] Impacto no número de instruções
