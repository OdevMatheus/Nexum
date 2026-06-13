# NEXUM - Makefile Orchestration
# Facilita a execução cross-platform mantendo a raiz limpa

.PHONY: dev clean help

# Variável para detectar o SO atual
ifeq ($(OS),Windows_NT)
    RUN_SCRIPT := scripts\run.cmd
    CLEAN_SCRIPT := scripts\clean-all.cmd
else
    RUN_SCRIPT := bash scripts/run.sh
    CLEAN_SCRIPT := bash scripts/clean-all.sh
endif

help: ## Exibe a lista de comandos disponíveis
	@echo "Comandos disponíveis:"
	@echo "  make dev      - Inicia a aplicação (Exibe o menu interativo Modo 1 ou 2)"
	@echo "  make clean    - Faz o reset completo do ambiente e containers Docker"

dev: ## Inicia o ambiente através do wrapper interativo de scripts
	$(RUN_SCRIPT)

clean: ## Limpa todas as instâncias e pacotes baixados
	$(CLEAN_SCRIPT)