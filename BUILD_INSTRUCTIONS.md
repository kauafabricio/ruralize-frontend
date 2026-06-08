# 📋 Instruções para Build Local

## Pré-requisitos
- Node.js 18+ instalado
- npm 9+

## Passos

### 1. Instalar dependências
```bash
npm install
```

### 2. Rodar build
```bash
npm run build
```

Se houver erros de tipagem ou lint, eles aparecerão aqui.

### 3. Corrigir erros
- Se houver erros TypeScript, abra os arquivos indicados e corrija
- Se houver erros ESLint, execute `npm run lint` para detalhes
- Erros comuns:
  - Imports não encontrados → verificar caminho relativo
  - Tipos não correspondentes → verificar tipos em `posts.api.ts`

### 4. Executar servidor dev (opcional)
```bash
npm run dev
```
Acesse http://localhost:3000

### 5. Commit
Após o build passar com sucesso:
```bash
git add .
git commit -m "refactor: estruturar postagens com ações sustentáveis"
git push
```

---

## Checklist de Implementação

✅ Frontend:
- [x] Tipos criados (`SustainableAction`, `PostCreate`, `PostResponse`)
- [x] `PostComposer` refatorado com seletor e modal de nova ação
- [x] `PostCard` exibindo badge com ícone
- [x] `FeedTabs` filtrando por ação
- [x] Imports validados
- [ ] **npm run build** executado com sucesso

🔄 Backend (próxima sessão):
- [ ] Tabela `sustainable_actions` criada
- [ ] 10 ações padrão populadas
- [ ] APIs GET/POST `/sustainable-actions/`
- [ ] Posts migrados para `sustainable_action_id`
- [ ] Testes end-to-end

---

## Se o Build Falhar

1. **Erro de importação:**
   - Verifique se o arquivo existe: `app/lib/sustainableActions.ts`
   - Verifique se o path está correto (use `@/app/...`)

2. **Erro de tipo:**
   - Abra `app/services/api/posts.api.ts`
   - Verifique se os tipos `PostCreate`, `PostUpdate`, `PostResponse` têm os campos `sustainable_action_id`

3. **Erro de sintaxe:**
   - Verifique fechamento de componentes (JSX)
   - Verifique se há vírgulas faltando em objetos

4. **Dúvidas:**
   - Consulte os comentários nos arquivos
   - Execute `npm run lint` para diagnóstico mais detalhado

---

## Resumo das Mudanças

| Arquivo | Mudança |
|---------|---------|
| `app/lib/sustainableActions.ts` | ✨ **NOVO**: Tipos, ações padrão, funções auxiliares |
| `app/services/api/posts.api.ts` | `sustainable_action_id` adicionado aos tipos |
| `app/components/feed/PostComposer.tsx` | Seletor de ações + modal para criar |
| `app/components/feed/PostCard.tsx` | Badge com ícone + nome da ação |
| `app/components/feed/FeedTabs.tsx` | Filtros dinâmicos baseados em ações |

---

Boa sorte! 🌱
