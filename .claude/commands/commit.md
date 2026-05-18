---
name: commit
description: Analise as mudanças no repositório git e sugira uma mensagem de commit clara e concisa em português, seguindo o padrão conventional commits.
argument-hint: [-y]
---

Analise as mudanças no repositório git (usando git status e git diff) e sugira uma mensagem de commit clara e concisa em português,
seguindo o padrão conventional commits (feat, fix, docs, chore, etc.).

Importante: veja também as diferenças de arquivos não estagiados.

Se a flag -y for fornecida faça o commit
Se a flag -y não for fornecidade pergunte se o commit deve ser feito ou não. Aborte caso o usuario escolha "não"

Caso positivo, faça a adição do arquivos (com git add) e depois faça o commit com a mensagem sugerida.
