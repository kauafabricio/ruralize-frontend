import { NextResponse } from "next/server";

type RewardRedemptionRequest = {
  userEmail?: string;
  userName?: string;
  rewardTitle?: string;
  rewardPoints?: number;
  pickupLocation?: string;
  deadline?: string;
  instructions?: string[];
  userId?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | RewardRedemptionRequest
    | null;

  if (!payload?.userEmail || !payload.rewardTitle || !payload.rewardPoints) {
    return NextResponse.json(
      { message: "Dados do resgate incompletos. Email, titulo e pontos sao obrigatorios." },
      { status: 400 },
    );
  }

  if (!payload.userEmail.includes("@")) {
    return NextResponse.json(
      { message: "Email invalido." },
      { status: 400 },
    );
  }

  const emailPayload = {
    to: payload.userEmail,
    subject: `Instrucoes para retirada: ${payload.rewardTitle}`,
    text: buildRewardEmailText(payload),
    html: buildRewardEmailHtml(payload),
    metadata: payload,
  };

  const webhookUrl = process.env.REWARD_REDEMPTION_EMAIL_WEBHOOK_URL;

  // Se nao houver webhook, apenas confirma o resgate
  if (!webhookUrl) {
    return NextResponse.json(
      {
        message:
          "Resgate registrado com sucesso. Email sera enviado em breve.",
        emailSent: false,
      },
      { status: 200 },
    );
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.REWARD_REDEMPTION_EMAIL_WEBHOOK_TOKEN
          ? {
              Authorization: `Bearer ${process.env.REWARD_REDEMPTION_EMAIL_WEBHOOK_TOKEN}`,
            }
          : {}),
      },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      // Mesmo que o email falhe, o resgate foi registrado
      return NextResponse.json(
        {
          message: "Resgate registrado. Email sera enviado em breve.",
          emailSent: false,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        message: "Resgate registrado e email enviado com sucesso.",
        emailSent: true,
      },
      { status: 200 },
    );
  } catch (error) {
    // Mesmo com erro na requisicao, confirma o resgate
    return NextResponse.json(
      {
        message: "Resgate registrado com sucesso. Email sera enviado em breve.",
        emailSent: false,
      },
      { status: 200 },
    );
  }
}

function buildRewardEmailText(payload: RewardRedemptionRequest) {
  return [
    `Ola${payload.userName ? `, ${payload.userName}` : ""}.`,
    "",
    `Recebemos sua solicitacao de resgate: ${payload.rewardTitle}.`,
    `Pontos utilizados: ${payload.rewardPoints}.`,
    `Local de retirada: ${payload.pickupLocation ?? "a definir pela equipe"}.`,
    `Prazo estimado: ${payload.deadline ?? "ate 5 dias uteis"}.`,
    "",
    "Passo a passo:",
    ...(payload.instructions ?? []).map(
      (instruction, index) => `${index + 1}. ${instruction}`,
    ),
    "",
    "Guarde este e-mail ate concluir a retirada da recompensa.",
  ].join("\n");
}

function buildRewardEmailHtml(payload: RewardRedemptionRequest) {
  const instructions = payload.instructions ?? [];

  return `
    <div style="font-family:Arial,sans-serif;color:#1e261e;line-height:1.5">
      <h1 style="color:#287630">Solicitacao de resgate recebida</h1>
      <p>Ola${payload.userName ? `, ${escapeHtml(payload.userName)}` : ""}.</p>
      <p>Recebemos sua solicitacao de resgate: <strong>${escapeHtml(
        payload.rewardTitle ?? "",
      )}</strong>.</p>
      <p><strong>Pontos utilizados:</strong> ${payload.rewardPoints}</p>
      <p><strong>Local de retirada:</strong> ${escapeHtml(
        payload.pickupLocation ?? "a definir pela equipe",
      )}</p>
      <p><strong>Prazo estimado:</strong> ${escapeHtml(
        payload.deadline ?? "ate 5 dias uteis",
      )}</p>
      <h2>Passo a passo</h2>
      <ol>
        ${instructions
          .map((instruction) => `<li>${escapeHtml(instruction)}</li>`)
          .join("")}
      </ol>
      <p>Guarde este e-mail ate concluir a retirada da recompensa.</p>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
