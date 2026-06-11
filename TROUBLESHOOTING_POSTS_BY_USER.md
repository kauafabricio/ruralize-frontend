# Troubleshooting - Posts por Usuário Não Carregam

## Sintoma
Ao visualizar o perfil de um usuário, os posts não carregam e aparece erro de rede.

## Erro no Console
```
[API_NO_RESPONSE] GET https://rural-backend.vercel.app/posts/?user_id=69f6f1e01b8b0b3c6b3eb277
Servidor não respondeu. Verifique sua conexão ou a disponibilidade do servidor.
```

## Possíveis Causas

### 1. Endpoint não existe no backend
**Verificar:** O backend implementou `GET /posts/?user_id={userId}`?

**Solução:**
Se não, implemente no backend:
```python
@app.get("/posts/")
def get_posts(
    user_id: str = Query(None),
    skip: int = Query(0),
    limit: int = Query(10)
):
    """
    Listar posts com filtro opcional por user_id
    """
    if user_id:
        return db.query(Post).filter(Post.user_id == user_id).offset(skip).limit(limit).all()
    return db.query(Post).offset(skip).limit(limit).all()
```

### 2. CORS não está configurado
**Verificar:** O backend retorna header `Access-Control-Allow-Origin`?

**Solução:**
Se está em localhost ou diferente de onde frontend faz requisição, habilitar CORS:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://ruralize.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Autenticação não está funcionar
**Verificar:** O backend valida header `Authorization: Bearer {token}`?

**Solução:**
Implementar middleware de autenticação:
```python
async def verify_token(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Token não fornecido")
    # ... validar token
```

### 4. Filtro de query_id não está sendo aplicado
**Verificar:** O backend ignora o parâmetro `user_id`?

**Solução:**
Certifique-se de que está usando o parâmetro:
```python
# ✅ CORRETO - usa o parâmetro
user_id = request.query_params.get("user_id")
if user_id:
    posts = db.filter(Post.user_id == user_id)

# ❌ ERRADO - ignora o parâmetro
posts = db.all()
```

---

## Como Testar Localmente

### 1. Testar com curl
```bash
# Obter um user_id válido (do seu token JWT)
USER_ID="seu_user_id_aqui"
TOKEN="seu_token_jwt_aqui"

# Testar endpoint
curl -X GET "http://localhost:8000/posts/?user_id=$USER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-User-Id: $USER_ID" \
  -H "Content-Type: application/json" \
  -v
```

### 2. Verificar logs do backend
Procure por mensagens como:
- "GET /posts/" - requisição chegou
- Qualquer erro de autenticação
- Qualquer erro de query no banco de dados

### 3. Verificar Devtools do Frontend
1. Abra F12 → Network
2. Filtrar por `/posts/`
3. Clique na requisição e verifique:
   - Request Headers (Authorization, X-User-Id)
   - Response Status (200, 401, 404, 500?)
   - Response body (erro específico do backend)

---

## Soluções Alternativas

Se o backend não pode suportar `/posts/?user_id={userId}`, implemente uma das alternativas:

### Alternativa 1: Novo Endpoint
```python
@app.get("/profiles/user/{user_id}/posts")
def get_user_posts(user_id: str, skip: int = 0, limit: int = 10):
    return db.query(Post).filter(Post.user_id == user_id).all()
```

### Alternativa 2: Usar Feed
```python
@app.get("/feed/")
def get_feed(user_id: str = Query(None), ...):
    if user_id:
        # Retornar posts do usuário
        return posts_do_usuario
    # Retornar feed geral
```

### Alternativa 3: Frontend Filtra Localmente
```typescript
// Frontend obtém todos os posts e filtra
const allPosts = await getGeneralFeed();
const userPosts = allPosts.filter(p => p.user_id === userId);
```

---

## Checklist de Verificação

- [ ] Endpoint `/posts/?user_id={userId}` existe no backend?
- [ ] Retorna status 200 OK?
- [ ] CORS está configurado?
- [ ] Autenticação está validando tokens corretamente?
- [ ] Query param `user_id` está sendo aplicado?
- [ ] Dados são retornados em JSON correto?

---

## Contato & Escalação

Se nenhuma solução funcionar:
1. Verifique logs do backend para erro específico
2. Teste com curl/Postman para isolar problema
3. Comunique qual alternativa o backend irá implementar
4. Frontend será atualizado conforme necessário
