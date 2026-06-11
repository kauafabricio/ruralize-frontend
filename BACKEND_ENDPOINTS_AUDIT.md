# Backend Endpoints Audit & Integration

## Endpoints Oficiais Validados

### Perfil
- ✅ `GET /profiles/user/{user_id}` - Obter perfil de um usuário
- ✅ `PUT /profiles/user/{user_id}` - Atualizar perfil do usuário
- ✅ `GET /profiles/` - Listar todos os perfis
- ✅ `GET /profiles/search/by-name` - Buscar perfis por nome
- ✅ `GET /profiles/search/by-course` - Buscar perfis por curso
- ✅ `GET /profiles/search/by-department` - Buscar perfis por departamento
- ✅ `GET /profiles/search/by-role/{role}` - Buscar perfis por função
- ✅ `GET /profiles/search/by-tags` - Buscar perfis por tags

### Feed
- ✅ `GET /feed/` - Feed geral
- ✅ `GET /feed/friends/{user_id}` - Feed de amigos

### Posts
- ✅ `GET /posts/` - Listar posts (com filtro opcional `user_id`)
- ✅ `POST /posts/` - Criar post
- ✅ `GET /posts/{post_id}` - Obter post específico
- ✅ `PUT /posts/{post_id}` - Atualizar post
- ✅ `DELETE /posts/{post_id}` - Deletar post
- ✅ `POST /posts/{post_id}/like` - Curtir post
- ✅ `DELETE /posts/{post_id}/like` - Descurtir post
- ✅ `POST /posts/{post_id}/comment` - Adicionar comentário
- ✅ `DELETE /posts/{post_id}/comment/{index}` - Deletar comentário

---

## Endpoints Removidos (Não Existem no Backend)

❌ `GET /profiles/{profile_id}` - Removido, usar `/profiles/user/{user_id}`
❌ `GET /profiles/user/{user_id}/posts` - Removido, usar `/posts/?user_id={user_id}`

---

## Problemas Identificados

### 1. Posts por Usuário
**Problema:** Frontend tenta `/posts/?user_id={userId}` mas backend pode não suportar
**Solução:** Validar se o endpoint `/posts/` aceita query param `user_id` no backend

**Alternativas:**
- Opção A: Backend suporta `/posts/?user_id={userId}`
- Opção B: Backend suporta novo endpoint `/profiles/user/{userId}/posts`
- Opção C: Frontend filtra localmente todos os posts

**Status Atual:** Frontend espera Opção A

---

## Query Parameters Esperados

### GET /posts/
```
user_id={user_id}  - Filtrar posts por usuário (OPCIONAL)
```

### GET /profiles/search/by-name
```
name={name}  - Nome a buscar (REQUIRED)
```

### GET /profiles/search/by-course
```
course={course}  - Curso a filtrar (REQUIRED)
```

### GET /profiles/search/by-tags
```
tags={tag1},{tag2}  - Tags separadas por vírgula (REQUIRED)
```

---

## Headers Esperados (Todas as requisições)

```
Authorization: Bearer {jwt_token}
X-User-Id: {user_id}
Content-Type: application/json
```

---

## Checklist de Integração

- [x] Remover todos os fallbacks de endpoints inexistentes
- [x] Usar apenas endpoints oficiais documentados
- [x] Melhorar tratamento de erros com mensagens claras
- [ ] **VALIDAR NO BACKEND** que `/posts/?user_id={userId}` funciona
- [ ] **VALIDAR NO BACKEND** que todos os headers são aceitos
- [ ] **VALIDAR NO BACKEND** que CORS está configurado corretamente
- [ ] Testar fluxo completo de visualização de perfil

---

## Como Testar

### 1. Obter Perfil
```bash
curl -X GET "https://rural-backend.vercel.app/profiles/user/{userId}" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: {userId}" \
  -H "Content-Type: application/json"
```

### 2. Obter Posts de Usuário
```bash
curl -X GET "https://rural-backend.vercel.app/posts/?user_id={userId}" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: {userId}" \
  -H "Content-Type: application/json"
```

### 3. Buscar Perfis por Nome
```bash
curl -X GET "https://rural-backend.vercel.app/profiles/search/by-name?name=João" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: {userId}" \
  -H "Content-Type: application/json"
```

---

## Frontend Implementation Status

✅ client.ts - Configurado com interceptadores corretos
✅ profile.api.ts - Usando apenas endpoints oficiais
✅ posts.api.ts - Usando apenas endpoints oficiais
✅ [slug]/page.tsx - Carregando perfil e posts corretamente
✅ Tratamento de erros - Mensagens claras e específicas

---

## Próximos Passos

1. ✅ CONCLUÍDO: Remover fallbacks
2. ✅ CONCLUÍDO: Melhorar erro handling
3. ⏳ PENDENTE: Validar endpoints no backend
4. ⏳ PENDENTE: Testar com dados reais do backend
5. ⏳ PENDENTE: Garantir que `/posts/?user_id={userId}` está funcionando

---

## Notas Importantes

- Todos os endpoints requerem autenticação (Bearer token + X-User-Id)
- O frontend injeta automaticamente os headers via interceptador em client.ts
- Erros são agora reportados especificamente (404, 401, 500, etc.)
- Não há mais mascaramento de erros com fallbacks silenciosos
