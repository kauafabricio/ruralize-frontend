# Guia de Integração - Sistema de Recompensas Atualizado

## Resumo das Alterações

O frontend foi totalmente adaptado para consumir corretamente os novos endpoints do backend do sistema de recompensas. O backend agora é responsável por toda a lógica de negócio, enquanto o frontend funciona apenas como cliente.

---

## Alterações Principais

### 1. **API Endpoints** (`app/services/api/rewards.api.ts`)

#### Antes
```typescript
export async function redeemReward(
  userId: string,
  rewardTitle: string,
  rewardCost: number,
  pickupLocation: string,
  deadline: string,
  instructions?: string[]
)
```

#### Depois
```typescript
export async function redeemReward(rewardId: string): Promise<RedemptionResponse>
export async function getAvailableRewards(): Promise<Reward[]>
export async function getUserRedemptions(): Promise<RedemptionHistory[]>
```

**Mudança Principal**: Removido envio de dados de email no request. O backend agora cuida de tudo.

---

### 2. **Request/Response Format**

#### POST /rewards/redeem

**Antes (ERRADO)**:
```json
{
  "user_id": "123",
  "reward_id": "456",
  "email": "usuario@email.com",
  "reward_title": "Combo RU",
  "reward_cost": 1000
}
```

**Depois (CORRETO)**:
```json
{
  "reward_id": "456"
}
```

**Headers**:
```
Authorization: Bearer {token}
X-User-Id: {user_id}
Content-Type: application/json
```

**Response**:
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

---

### 3. **Fluxo de Resgate Completo**

1. ✅ Modal de confirmação exibe saldo e custo
2. ✅ User confirma clicando em "Confirmar resgate"
3. ✅ Loading durante a requisição (impede múltiplos cliques)
4. ✅ Backend processa:
   - Busca email do usuário no banco
   - Gera código de resgate único
   - Valida saldo de pontos
   - Registra o resgate
   - Envia email automaticamente
   - Desconta os pontos
5. ✅ Frontend recebe resposta com:
   - Código de resgate
   - Email de confirmação
   - Prazo para retirada
6. ✅ UI atualiza imediatamente:
   - Saldo de pontos atualizado
   - Histórico de resgates
   - Modal exibe sucesso com código

---

### 4. **Tratamento de Erros**

O frontend agora mapeia erros HTTP para mensagens em português:

| Status | Mensagem |
|--------|----------|
| 400 | Não foi possível realizar o resgate. |
| 402 | Você não possui pontos suficientes para esta recompensa. |
| 404 | Recompensa não encontrada. |
| 500 | Erro interno do servidor. Tente novamente mais tarde. |

---

### 5. **Páginas Criadas/Alteradas**

#### `app/pontos/page.tsx`
- ✅ Carrega recompensas do backend
- ✅ Carrega histórico de resgates
- ✅ Implementa novo fluxo de resgate
- ✅ Modal com 3 estados: "confirm", "received", "error"
- ✅ Exibe código de resgate em local destacado
- ✅ Link para "Meus Resgates"

#### `app/pontos/resgates/page.tsx` (NOVO)
- ✅ Tela dedicada para visualizar todos os resgates
- ✅ Exibe status (Pendente, Retirado, Expirado)
- ✅ Permite copiar código de resgate
- ✅ Modal com detalhes completos do resgate
- ✅ Instruções passo-a-passo para retirada

---

### 6. **Atualização do Cliente API** (`app/services/api/client.ts`)

Adicionado header `X-User-Id` automaticamente em todas as requisições:

```typescript
if (session.user?.id) {
  config.headers["X-User-Id"] = session.user.id;
}
```

---

## Tipos TypeScript

```typescript
export interface Reward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  pickup_location: string;
  deadline_days: number;
  image_url?: string;
}

export interface RedemptionResponse {
  success: boolean;
  data: {
    redemption_code: string;
    user_email: string;
    pickup_deadline: string;
  };
}

export interface RedemptionHistory {
  id: string;
  reward_name: string;
  redemption_code: string;
  status: "pending" | "collected" | "expired";
  redemption_date: string;
  pickup_deadline: string;
}
```

---

## Fluxo de Dados

```
User Click
    ↓
Modal Confirmação
    ↓
API: POST /rewards/redeem (rewardId)
    ↓
Backend:
  - Busca email do usuário
  - Gera código único
  - Valida saldo
  - Envia email
  - Desconta pontos
    ↓
Response com código e deadline
    ↓
Frontend:
  - Atualiza saldo
  - Atualiza histórico
  - Exibe sucesso
  - Mostra código
```

---

## Mensagens Exibidas

### Sucesso
```
✓ Resgate realizado com sucesso!
  As instruções de retirada e o código de resgate foram enviados para o e-mail cadastrado.

Código de Resgate: A7K9M2P4
Enviado para: usuario@ufrpe.edu.br
Prazo para retirada: 30/06/2026
```

### Erro - Sem Pontos
```
✗ Erro ao resgatar
  Você não possui pontos suficientes para esta recompensa.
```

### Erro - Genérico
```
✗ Erro ao resgatar
  Não foi possível realizar o resgate.
```

---

## Historico de Resgates

Exibe para cada resgate:
- **Nome da Recompensa**: "Combo - 5 Fichas do RU Janta"
- **Código**: "A7K9M2P4"
- **Status**: Pendente | Retirado | Expirado
- **Data do Resgate**: 25/06/2026
- **Prazo**: 30/06/2026

---

## Próximas Etapas (Optional)

1. Integrar com sistema de notificações para confirmações
2. Adicionar filtros no histórico (por status, por data)
3. Exportar histórico em PDF
4. Notificação quando prazo está próximo do vencimento
5. Dashboard de analytics de resgates

---

## Testes Recomendados

```bash
# 1. Resgatar uma recompensa com pontos suficientes
# 2. Tentar resgatar sem pontos suficientes
# 3. Tentar resgatar recompensa inexistente
# 4. Verificar se histórico atualiza em tempo real
# 5. Copiar código de resgate
# 6. Voltar e verificar se saldo foi atualizado
```

---

## Dependências

- React 19.2.4
- Next.js 16.2.4
- Axios 1.16.1
- TypeScript 5

---

## Conclusão

O frontend agora está completamente sincronizado com o backend. Toda a lógica de negócio está no backend, e o frontend apenas consome os endpoints e exibe os dados de forma amigável. O usuário pode resgatar recompensas, receber confirmação imediata, copiar o código, e acompanhar todos os seus resgates em uma página dedicada.
