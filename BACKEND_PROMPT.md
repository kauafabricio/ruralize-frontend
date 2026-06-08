# Backend: Refatoração de Ações Sustentáveis - Prompt para Nova Sessão

## Resumo
O frontend foi refatorado para trabalhar com ações sustentáveis como entidades estruturadas em vez de strings simples. Você precisa criar a infraestrutura no backend para suportar esse novo sistema.

---

## Arquitetura

### Nova Entidade: SustainableAction
Crie uma tabela/documento com:
```python
{
  "id": "tree-planting",  # slug/ID único
  "name": "Plantio de Árvores",
  "icon": "🌱",
  "is_default": True,
  "created_by": "user_id" | None,  # None para ações padrão
  "created_at": "2024-06-07T10:00:00Z"
}
```

### Ações Padrão (10 obrigatórias)
1. `tree-planting` - 🌱 Plantio de Árvores
2. `recycling` - ♻️ Reciclagem
3. `water-conservation` - 💧 Conservação de Água
4. `energy-efficiency` - ⚡ Eficiência Energética
5. `composting` - 🌿 Compostagem
6. `biodiversity` - 🦋 Biodiversidade
7. `sustainable-agriculture` - 🌾 Agricultura Sustentável
8. `clean-energy` - ☀️ Energia Limpa
9. `pollution-reduction` - 🌍 Redução de Poluição
10. `education` - 📚 Educação Ambiental

---

## Alterações no Schema

### Posts
```python
{
  "id": "post_id",
  "user_id": "user_id",
  "content": "...",
  "sustainable_action_id": "tree-planting",  # NOVO: referência à ação
  "location": "...",
  "event_id": "...",
  "image_url": "...",
  "likes": 0,
  "liked_by": [...],
  "comments": [...],
  "created_at": "..."
}
```

**Mudanças:**
- NOVO: `sustainable_action_id` (FK para `SustainableAction`)
- DEPRECADO: `sustainable_action` (string) → mantém compatibilidade curta
- Ação padrão para posts antigos: mapear campos legacy para IDs
  - "general" → "tree-planting"
  - "events" → "tree-planting"
  - "warnings" → "pollution-reduction"
  - "projects" → "sustainable-agriculture"

---

## APIs Necessárias

### 1. Listar Ações
**GET** `/sustainable-actions/`
```json
Response:
[
  {
    "id": "tree-planting",
    "name": "Plantio de Árvores",
    "icon": "🌱",
    "is_default": true
  }
]
```

### 2. Criar Ação (usuário)
**POST** `/sustainable-actions/`
```json
Payload:
{
  "name": "Limpeza de Praia",
  "icon": "🌊"  // opcional: usar 🌱 se não fornecido
}

Response:
{
  "id": "custom_action_id",
  "name": "Limpeza de Praia",
  "icon": "🌊",
  "is_default": false,
  "created_by": "user_id",
  "created_at": "..."
}
```

### 3. Atualizar Post (existente)
**PUT** `/posts/{post_id}`
```json
Payload:
{
  "content": "...",
  "sustainable_action_id": "tree-planting",  // NOVO
  "sustainable_action": "..." // mantém compatibilidade
}
```

### 4. Criar Post (existente)
**POST** `/posts/`
```json
Payload:
{
  "content": "...",
  "sustainable_action_id": "tree-planting",  // NOVO (prioritário)
  "sustainable_action": "..."  // compatibilidade
}
```

---

## Migração de Dados

1. Populate `sustainable_actions` com 10 ações padrão
2. Para posts existentes:
   - Se `sustainable_action_id` existir: manter
   - Se `sustainable_action` for string:
     - Fazer lookup na tabela (buscar por nome)
     - Se encontrar: usar seu ID
     - Se não encontrar ou for valor legacy: mapear conforme tabela acima
   - Salvar `sustainable_action_id` novo

---

## Validações

- `sustainable_action_id` em POST/PUT deve existir em `sustainable_actions`
- Ações criadas por usuários devem ter `created_by = user_id`
- Ações padrão têm `created_by = NULL`
- Ao criar post: pelo menos um de `sustainable_action_id` ou `sustainable_action` (para fallback)

---

## Notas Frontend ↔ Backend

- Frontend envia `sustainable_action_id` como string (ID/slug)
- Frontend sempre exibe o ícone consultando a entidade (ou mapa local de padrão)
- Compatibilidade: backend pode aceitar `sustainable_action` como fallback, mas prioriza `sustainable_action_id`
- Resposta deve sempre retornar ambos: `sustainable_action_id` e `sustainable_action` (nome)

---

## Checklist

- [ ] Criar tabela `sustainable_actions`
- [ ] Popular ações padrão (10)
- [ ] Migrar dados de `posts.sustainable_action` → `sustainable_action_id`
- [ ] Criar API GET `/sustainable-actions/`
- [ ] Criar API POST `/sustainable-actions/`
- [ ] Atualizar API PUT/POST `/posts/{id}` para suportar `sustainable_action_id`
- [ ] Atualizar resposta de GET `/posts/` para retornar `sustainable_action_id`
- [ ] Testes: criar post com nova ação, listar, editar
- [ ] Testes: compatibilidade com dados antigos (posts sem action_id)

---

## Próximas Etapas

1. Implemente as mudanças acima
2. Teste as APIs com curl/Postman
3. Frontend rodará `npm run build` localmente e integrará
4. Teste end-to-end: criar post → exibir badge → filtrar por ação

**Quando pronto:** Comunique a URL de staging e confirme que as APIs estão respondendo conforme esperado.
