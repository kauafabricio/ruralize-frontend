# Referência de Endpoints - Sistema de Recompensas

## Base URL
```
https://rural-backend.vercel.app
```

---

## Endpoints de Recompensas

### 1. Listar Recompensas Disponíveis

**Endpoint**: `GET /rewards`

**Headers**:
```
Authorization: Bearer {token}
X-User-Id: {user_id}
Content-Type: application/json
```

**Response** (200 OK):
```json
[
  {
    "id": "reward_001",
    "name": "Combo - 5 Fichas do RU Janta",
    "description": "Troque seus pontos por 5 fichas de RU - Janta.",
    "points_required": 1000,
    "pickup_location": "Restaurante Universitario - guiche de atendimento",
    "deadline_days": 5,
    "image_url": "https://example.com/image.jpg"
  },
  ...
]
```

---

### 2. Resgatar uma Recompensa

**Endpoint**: `POST /rewards/redeem`

**Headers**:
```
Authorization: Bearer {token}
X-User-Id: {user_id}
Content-Type: application/json
```

**Body**:
```json
{
  "reward_id": "reward_001"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "redemption_code": "A7K9M2P4",
    "user_email": "usuario@ufrpe.edu.br",
    "pickup_deadline": "2026-06-30T00:00:00"
  }
}
```

**Error Responses**:

- **400 Bad Request**:
```json
{
  "detail": "Não foi possível realizar o resgate."
}
```

- **402 Payment Required** (Pontos insuficientes):
```json
{
  "detail": "Você não possui pontos suficientes para esta recompensa."
}
```

- **404 Not Found** (Recompensa inexistente):
```json
{
  "detail": "Recompensa não encontrada."
}
```

- **500 Internal Server Error**:
```json
{
  "detail": "Erro interno do servidor. Tente novamente mais tarde."
}
```

---

### 3. Listar Resgates do Usuário

**Endpoint**: `GET /rewards/user/redemptions`

**Headers**:
```
Authorization: Bearer {token}
X-User-Id: {user_id}
Content-Type: application/json
```

**Response** (200 OK):
```json
[
  {
    "id": "redemption_001",
    "reward_name": "Combo - 5 Fichas do RU Janta",
    "redemption_code": "A7K9M2P4",
    "status": "pending",
    "redemption_date": "2026-06-25T14:30:00",
    "pickup_deadline": "2026-06-30T00:00:00"
  },
  {
    "id": "redemption_002",
    "reward_name": "Garrafa Térmica",
    "redemption_code": "B3L2M9K7",
    "status": "collected",
    "redemption_date": "2026-06-20T10:15:00",
    "pickup_deadline": "2026-06-23T00:00:00"
  },
  ...
]
```

**Status possíveis**:
- `pending` - Resgate realizado, aguardando retirada
- `collected` - Recompensa foi retirada
- `expired` - Prazo para retirada expirou

---

## Fluxo Completo de Resgate

### 1. Obter Recompensas Disponíveis
```bash
curl -X GET https://rural-backend.vercel.app/rewards \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: {user_id}" \
  -H "Content-Type: application/json"
```

### 2. Resgatar uma Recompensa
```bash
curl -X POST https://rural-backend.vercel.app/rewards/redeem \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: {user_id}" \
  -H "Content-Type: application/json" \
  -d '{
    "reward_id": "reward_001"
  }'
```

### 3. Obter Histórico de Resgates
```bash
curl -X GET https://rural-backend.vercel.app/rewards/user/redemptions \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: {user_id}" \
  -H "Content-Type: application/json"
```

---

## Notas Importantes

### Backend Responsabilidades ✅
- Buscar email do usuário no banco de dados
- Validar saldo de pontos do usuário
- Gerar código único para o resgate
- Registrar o resgate no banco de dados
- Descontar os pontos da conta do usuário
- **Enviar email automaticamente** com o código e instruções

### Frontend Responsabilidades ✅
- Exibir recompensas disponíveis
- Coletar confirmação do usuário
- Enviar apenas o `reward_id` para o backend
- Exibir o código de resgate retornado
- Atualizar UI com sucesso/erro
- Permitir visualização do histórico

### NÃO FAZER ❌
- ❌ Enviar email do usuário no request
- ❌ Validar saldo no frontend
- ❌ Descontar pontos no frontend
- ❌ Gerar código no frontend
- ❌ Enviar email desde o frontend

---

## Autenticação

Todos os endpoints requerem autenticação via Bearer Token. O token é obtido durante o login e deve ser incluído no header `Authorization`:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

O header `X-User-Id` também é necessário para identificar o usuário no backend.

---

## Taxa de Limite

_Documentação a ser adicionada conforme backend define_

---

## Versionamento

Versão atual: **v1**

Endpoints podem mudar em futuras versões. Acompanhe as atualizações do backend.

---

## Suporte

Para dúvidas sobre os endpoints, consulte:
- Backend Repository: `[link do repositório]`
- API Documentation: `[link da documentação]`
- Issues: `[link para reportar issues]`
