"use client";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PointsPage;
var react_1 = require("react");
var link_1 = require("next/link");
var RequireAuth_1 = require("@/app/components/auth/RequireAuth");
var AuthProvider_1 = require("@/app/components/auth/AuthProvider");
var FeedHeader_1 = require("@/app/components/feed/FeedHeader");
var rewards_api_1 = require("@/app/services/api/rewards.api");
var points_api_1 = require("@/app/services/api/points.api");
var rewardImageFallbacks = {
    "10 fichas de almoço no RU": "/ficharu1.jpeg",
    "10 fichas de jantar no RU": "/ficharu2.jpeg",
    "1 ecobag": "/ecobag.jpeg",
};
function resolveRewardImagePath(imageUrl) {
    if (!imageUrl) {
        return undefined;
    }
    var trimmed = imageUrl.trim();
    if (!trimmed) {
        return undefined;
    }
    var pathname = trimmed;
    try {
        var parsed = new URL(trimmed, "http://localhost");
        pathname = parsed.pathname;
    }
    catch (_a) {
        // Keep original trimmed value if it isn't a full URL.
        pathname = trimmed;
    }
    var filename = pathname
        .split("/")
        .filter(Boolean)
        .filter(function (segment) { return segment !== "app" && segment !== "public"; })
        .filter(function (segment) { return segment !== "src"; })
        .pop();
    if (!filename) {
        return undefined;
    }
    return "/".concat(filename);
}
function getRewardImageSrc(reward) {
    var imagePath = resolveRewardImagePath(reward.image_url);
    if (imagePath) {
        return imagePath;
    }
    return rewardImageFallbacks[reward.name];
}
// Ação de histórico para compatibilidade com UI existente
var actionHistory = [
    {
        icon: "recycle",
        title: "Descarte de Eletrônicos",
        details: "Ontem, às 14:30 - Campus UFRPE",
        points: "+120 pts",
        tone: "positive",
    },
    {
        icon: "seed",
        title: "Plantio de Mudas",
        details: "12 de Out - Horta Comunitária",
        points: "+200 pts",
        tone: "positive",
    },
    {
        icon: "ride",
        title: "Carona Solidária",
        details: "10 de Out - Aplicativo",
        points: "+45 pts",
        tone: "positive",
    },
];
function PointsPage() {
    var _this = this;
    var _a = (0, AuthProvider_1.useAuth)(), user = _a.user, session = _a.session;
    var _b = (0, react_1.useState)([]), rewards = _b[0], setRewards = _b[1];
    var _c = (0, react_1.useState)(0), pointsBalance = _c[0], setPointsBalance = _c[1];
    var _d = (0, react_1.useState)(null), selectedReward = _d[0], setSelectedReward = _d[1];
    var _e = (0, react_1.useState)("confirm"), rewardStep = _e[0], setRewardStep = _e[1];
    var _f = (0, react_1.useState)([]), redeemHistory = _f[0], setRedeemHistory = _f[1];
    var _g = (0, react_1.useState)(false), redeeming = _g[0], setRedeeming = _g[1];
    var _h = (0, react_1.useState)(null), redemptionError = _h[0], setRedemptionError = _h[1];
    var _j = (0, react_1.useState)(null), redemptionData = _j[0], setRedemptionData = _j[1];
    var _k = (0, react_1.useState)(true), loading = _k[0], setLoading = _k[1];
    // Carregar recompensas e histórico de resgate ao montar
    (0, react_1.useEffect)(function () {
        if (!session)
            return;
        var active = true;
        setLoading(true);
        var loadRewardsAndHistory = function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, rewardsData, historyData, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all([
                                (0, rewards_api_1.getAvailableRewards)(),
                                (0, rewards_api_1.getUserRedemptions)(),
                            ])];
                    case 1:
                        _a = _b.sent(), rewardsData = _a[0], historyData = _a[1];
                        if (!active)
                            return [2 /*return*/];
                        setRewards(rewardsData);
                        setRedeemHistory(historyData);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        console.error("Erro ao carregar recompensas ou histórico:", error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        var loadBalance = function () { return __awaiter(_this, void 0, void 0, function () {
            var balanceData, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, points_api_1.getPointsBalance)()];
                    case 1:
                        balanceData = _a.sent();
                        if (!active)
                            return [2 /*return*/];
                        setPointsBalance(balanceData.balance);
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error("Erro ao carregar saldo de pontos:", error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        Promise.allSettled([loadRewardsAndHistory(), loadBalance()]).finally(function () {
            if (!active)
                return;
            setLoading(false);
        });
        return function () {
            active = false;
        };
    }, [session]);
    function openRewardModal(reward) {
        setSelectedReward(reward);
        setRewardStep("confirm");
        setRedemptionError(null);
        setRedemptionData(null);
    }
    function closeRewardModal() {
        setSelectedReward(null);
        setRewardStep("confirm");
        setRedemptionError(null);
        setRedemptionData(null);
    }
    function handleConfirmRewardRedemption() {
        return __awaiter(this, void 0, void 0, function () {
            var response, balanceData, error_3, nextBalance, newRedemption_1, error_4, errorMessage, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!selectedReward || !(user === null || user === void 0 ? void 0 : user.id)) {
                            setRedemptionError("Erro: usuário não autenticado");
                            setRewardStep("error");
                            return [2 /*return*/];
                        }
                        if (pointsBalance < selectedReward.points_required) {
                            setRedemptionError("Você não possui pontos suficientes para esta recompensa.");
                            setRewardStep("error");
                            return [2 /*return*/];
                        }
                        setRedeeming(true);
                        setRedemptionError(null);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, 8, 9]);
                        return [4 /*yield*/, (0, rewards_api_1.redeemReward)(selectedReward.id)];
                    case 2:
                        response = _a.sent();
                        if (!response.success) {
                            throw new Error(response.message || "Falha ao processar resgate.");
                        }
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, (0, points_api_1.getPointsBalance)()];
                    case 4:
                        balanceData = _a.sent();
                        setPointsBalance(balanceData.balance);
                        return [3 /*break*/, 6];
                    case 5:
                        error_3 = _a.sent();
                        console.warn("Não foi possível atualizar o saldo após o resgate:", error_3);
                        nextBalance = pointsBalance - selectedReward.points_required;
                        setPointsBalance(nextBalance);
                        return [3 /*break*/, 6];
                    case 6:
                        newRedemption_1 = {
                            id: response.data.redemption_code,
                            reward_name: response.data.reward_name,
                            redemption_code: response.data.redemption_code,
                            status: response.data.status,
                            redemption_date: response.data.redeemed_at,
                            pickup_deadline: response.data.pickup_deadline,
                        };
                        setRedeemHistory(function (current) { return __spreadArray([newRedemption_1], current, true); });
                        // Exibir dados de sucesso
                        setRedemptionData({
                            code: response.data.redemption_code,
                            deadline: response.data.pickup_deadline,
                            pickupLocation: response.data.pickup_location,
                        });
                        setRewardStep("received");
                        return [3 /*break*/, 9];
                    case 7:
                        error_4 = _a.sent();
                        console.error("Erro ao resgatar:", error_4);
                        errorMessage = "Não foi possível realizar o resgate.";
                        if (typeof error_4 === "object" && error_4 !== null) {
                            message = error_4.message;
                            if (message) {
                                if (message.includes("Pontos insuficientes")) {
                                    errorMessage = "Você não possui pontos suficientes para esta recompensa.";
                                }
                                else if (message.includes("Recompensa não encontrada")) {
                                    errorMessage = "Recompensa não encontrada.";
                                }
                                else if (message.includes("Usuário não encontrado")) {
                                    errorMessage = "Usuário não autenticado.";
                                }
                                else if (message.includes("Erro interno")) {
                                    errorMessage = "Erro interno do servidor. Tente novamente mais tarde.";
                                }
                                else {
                                    errorMessage = message;
                                }
                            }
                        }
                        setRedemptionError(errorMessage);
                        setRewardStep("error");
                        return [3 /*break*/, 9];
                    case 8:
                        setRedeeming(false);
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    }
    // Criar histórico exibido combinando resgates e ações
    var displayedHistory = __spreadArray(__spreadArray([], redeemHistory.map(function (redemption) { return ({
        icon: "ticket",
        title: "Resgate: ".concat(redemption.reward_name),
        details: new Date(redemption.redemption_date).toLocaleDateString("pt-BR"),
        points: "-".concat(redemption.redemption_code),
        tone: "negative",
    }); }), true), actionHistory, true);
    return (<RequireAuth_1.RequireAuth>
      <main className="min-h-screen bg-[#f8f8f3] text-[#1f281f]">
        <FeedHeader_1.FeedHeader showSearch={false}/>

        <div className="mx-auto w-full max-w-[1220px] px-4 pb-10 pt-8 sm:px-7 lg:pt-11">
          <section className="grid gap-7 lg:grid-cols-[1fr_372px]">
            <div className="relative flex min-h-[210px] flex-col overflow-hidden rounded-[28px] bg-[#fbfbf7] px-6 py-8 shadow-[0_1px_0_rgba(33,55,30,0.05)] sm:flex-row sm:items-center sm:px-10">
              <LeafMark className="absolute -bottom-6 right-2 h-32 w-32 text-[#dfe8da]"/>

              <div className="relative z-10 flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full bg-white text-center shadow-[0_12px_30px_rgba(33,55,30,0.08)]">
                <strong className="text-[31px] font-black tracking-[-0.04em] text-[#287630]">
                  {pointsBalance}
                </strong>
                <span className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#6b7568]">
                  Pontos totais
                </span>
              </div>

              <div className="relative z-10 mt-7 max-w-[430px] sm:ml-9 sm:mt-0">
                <h1 className="text-[26px] font-black tracking-[-0.04em] text-[#1e261e] sm:text-[31px]">
                  Seu Impacto <span className="text-[#287630]">Floresce.</span>
                </h1>
                <p className="mt-4 text-[13px] font-medium leading-6 text-[#536050]">
                  Você está indo bem, continue contribuindo.
                </p>
              </div>
            </div>

            <aside className="flex min-h-[210px] flex-col justify-between rounded-[28px] bg-[#347a37] px-7 py-8 text-white shadow-[0_16px_34px_rgba(40,118,48,0.2)]">
              <div>
                <h2 className="text-[20px] font-black tracking-[-0.03em]">
                  Ganhe mais pontos hoje
                </h2>
                <p className="mt-5 max-w-[260px] text-[12px] font-semibold leading-6 text-[#dcefd9]">
                  Participe de mais eventos sustentáveis e consiga pontos mais recompensas.
                </p>
              </div>
            <link_1.default href="/agendamentos" className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-white px-7 text-[11px] font-black uppercase tracking-[0.08em] text-[#2f7934] transition hover:bg-[#edf8e9]">
              Ver eventos
            </link_1.default>
            </aside>
          </section>

          <section className="mt-14">
            <div className="flex items-end justify-between gap-5">
              <div>
                <h2 className="text-[23px] font-black tracking-[-0.04em] text-[#1e261e]">
                  Recompensas
                </h2>
                <p className="mt-2 text-[12px] font-semibold text-[#687266]">
                  Troque seus pontos por mimos sustentáveis
                </p>
              </div>

              <link_1.default href="/pontos/resgates" className="inline-flex shrink-0 items-center gap-2 text-[12px] font-black text-[#287630] transition hover:text-[#1d5c25]">
                Meus Resgates
                <ArrowIcon className="h-4 w-4"/>
              </link_1.default>
            </div>

            {loading ? (<div className="mt-8 flex items-center justify-center rounded-[22px] bg-white py-12">
                <p className="text-[13px] font-semibold text-[#687266]">Carregando recompensas...</p>
              </div>) : rewards.length === 0 ? (<div className="mt-8 flex items-center justify-center rounded-[22px] bg-white py-12">
                <p className="text-[13px] font-semibold text-[#687266]">Nenhuma recompensa disponível no momento.</p>
              </div>) : (<div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rewards.map(function (reward) { return (<article key={reward.id} className="overflow-hidden rounded-[22px] bg-white shadow-[0_1px_0_rgba(33,55,30,0.05)]">
                    <div className="relative h-[176px] overflow-hidden bg-[#e8e8e8]">
                      {getRewardImageSrc(reward) ? (<img src={getRewardImageSrc(reward)} alt={reward.name} className="h-full w-full object-cover" loading="lazy"/>) : (<div className="flex h-full items-center justify-center text-[12px] font-semibold text-[#687266]">
                          Imagem indisponível
                        </div>)}
                      <span className="absolute right-4 top-4 rounded-full bg-[#287630] px-3 py-1.5 text-[10px] font-black text-white shadow-[0_8px_16px_rgba(23,73,27,0.22)]">
                        {reward.points_required} pts
                      </span>
                    </div>

                    <div className="px-5 pb-6 pt-5">
                      <h3 className="text-[15px] font-black leading-5 tracking-[-0.02em] text-[#1e261e]">
                        {reward.name}
                      </h3>
                      <p className="mt-2 min-h-[38px] text-[11px] font-semibold leading-5 text-[#647061]">
                        {reward.description}
                      </p>
                      <button type="button" onClick={function () { return openRewardModal(reward); }} disabled={pointsBalance < reward.points_required} className="mt-5 h-10 w-full rounded-full bg-[#9ff0a1] text-[11px] font-black text-[#287630] transition hover:bg-[#8ee892] disabled:cursor-not-allowed disabled:bg-[#e2e6dc] disabled:text-[#8a9186]">
                        {pointsBalance >= reward.points_required
                    ? "Resgatar"
                    : "Pontos insuficientes"}
                      </button>
                    </div>
                  </article>); })}
              </div>)}
          </section>

          <section className="mt-16">
            <h2 className="text-[23px] font-black tracking-[-0.04em] text-[#1e261e]">
              Histórico de Ações
            </h2>

            <div className="mt-6 overflow-hidden rounded-[22px] bg-white shadow-[0_1px_0_rgba(33,55,30,0.05)]">
              {displayedHistory.length === 0 ? (<div className="flex items-center justify-center px-5 py-12">
                  <p className="text-[13px] font-semibold text-[#687266]">Nenhuma ação registrada ainda.</p>
                </div>) : (displayedHistory.map(function (action, index) {
            var positive = action.tone === "positive";
            return (<div key={"".concat(action.title, "-").concat(index)} className={"flex items-center justify-between gap-4 px-5 py-5 ".concat(index === 0 ? "" : "border-t border-[#edf0e8]")}>
                      <div className="flex min-w-0 items-center gap-4">
                        <span className={"flex h-11 w-11 shrink-0 items-center justify-center rounded-full ".concat(positive
                    ? "bg-[#dff6df] text-[#287630]"
                    : "bg-[#ffe2e2] text-[#c91f1f]")}>
                          <HistoryIcon name={action.icon} className="h-5 w-5"/>
                        </span>

                        <div className="min-w-0">
                          <h3 className="truncate text-[13px] font-black text-[#1e261e]">
                            {action.title}
                          </h3>
                          <p className="mt-1 truncate text-[11px] font-semibold text-[#7b8578]">
                            {action.details}
                          </p>
                        </div>
                      </div>

                      <strong className={"shrink-0 text-[13px] font-black ".concat(positive ? "text-[#287630]" : "text-[#c91f1f]")}>
                        {action.points}
                      </strong>
                    </div>);
        }))}
            </div>
          </section>
        </div>

        <footer className="border-t border-[#eceee8] bg-[#fbfbf7]">
          <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-4 px-4 py-8 text-[11px] font-semibold text-[#8a9186] sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <p>
              <span className="font-black text-[#287630]">Ruralize</span> UFRPE
              Living
            </p>
            <nav className="flex flex-wrap gap-7">
              <a href="#" className="transition hover:text-[#287630]">
                Termos de Uso
              </a>
              <a href="#" className="transition hover:text-[#287630]">
                Privacidade
              </a>
              <a href="#" className="transition hover:text-[#287630]">
                Contato
              </a>
            </nav>
            <p>© 2024 Ruralize - UFRPE Living Canvas</p>
          </div>
        </footer>

        {selectedReward ? (<RewardRedemptionModal reward={selectedReward} step={rewardStep} pointsBalance={pointsBalance} isRedeeming={redeeming} error={redemptionError} redemptionData={redemptionData} onConfirm={handleConfirmRewardRedemption} onClose={closeRewardModal}/>) : null}
      </main>
    </RequireAuth_1.RequireAuth>);
}
function RewardRedemptionModal(_a) {
    var reward = _a.reward, step = _a.step, pointsBalance = _a.pointsBalance, isRedeeming = _a.isRedeeming, error = _a.error, redemptionData = _a.redemptionData, onConfirm = _a.onConfirm, onClose = _a.onClose;
    return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#d7ddd3]/70 px-4 py-8 backdrop-blur-[5px]">
      <section role="dialog" aria-modal="true" aria-labelledby="reward-redemption-title" className="w-full max-w-[430px] rounded-[24px] bg-white px-7 pb-7 pt-8 shadow-[0_24px_50px_rgba(33,55,30,0.22)]">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#287630]">
              {reward.points_required} pts
            </p>
            <h2 id="reward-redemption-title" className="mt-2 text-[22px] font-black tracking-[-0.04em] text-[#1e261e]">
              {step === "confirm"
            ? "Confirmar resgate"
            : step === "error"
                ? "Erro ao resgatar"
                : "Resgate realizado"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1f3ed] text-[18px] font-black text-[#596255] transition hover:bg-[#e5e9df]" aria-label="Fechar">
            x
          </button>
        </div>

        {step === "confirm" ? (<>
            <p className="mt-5 text-[13px] font-semibold leading-6 text-[#566052]">
              Você está prestes a resgatar <strong>{reward.name}</strong>.
              Confirme para iniciar o processo e receber o código de retirada.
            </p>
            <div className="mt-5 rounded-[18px] bg-[#f7f9f4] px-5 py-4 text-[12px] font-semibold leading-5 text-[#536050]">
              <p>Saldo atual: {pointsBalance} pts</p>
              <p>Custo do resgate: {reward.points_required} pts</p>
              <p>Saldo após o resgate: {pointsBalance - reward.points_required} pts</p>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={onClose} className="h-11 rounded-full bg-[#eef0ea] px-5 text-[11px] font-black text-[#4f5b4e]">
                Voltar
              </button>
              <button type="button" onClick={onConfirm} disabled={isRedeeming} className="h-11 rounded-full bg-[#287630] px-5 text-[11px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.18)] disabled:opacity-60">
                {isRedeeming ? "Registrando..." : "Confirmar resgate"}
              </button>
            </div>
          </>) : step === "error" ? (<>
            {error && (<p className="mt-5 rounded-[14px] bg-[#fff3f3] px-4 py-3 text-[12px] font-bold leading-5 text-[#b92828]">
                {error}
              </p>)}
            <div className="mt-7 grid gap-3">
              <button type="button" onClick={onClose} className="h-11 rounded-full bg-[#287630] px-5 text-[11px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.18)]">
                Voltar
              </button>
            </div>
          </>) : (<>
            <p className="mt-5 text-[13px] font-semibold leading-6 text-[#566052]">
              Resgate realizado com sucesso! Guarde o código abaixo e leve-o ao local de retirada.
            </p>
            
            {(redemptionData === null || redemptionData === void 0 ? void 0 : redemptionData.code) && (<div className="mt-6 rounded-[16px] bg-[#f7f9f4] px-5 py-4">
                <p className="text-[11px] font-semibold text-[#536050]">Código de Resgate:</p>
                <p className="mt-2 text-center text-[20px] font-black tracking-wider text-[#287630]">
                  {redemptionData.code}
                </p>
              </div>)}

            {(redemptionData === null || redemptionData === void 0 ? void 0 : redemptionData.pickupLocation) && (<div className="mt-4 rounded-[14px] bg-[#f0f8f0] px-4 py-3">
                <p className="text-[11px] font-semibold text-[#536050]">
                  Local de retirada: <span className="font-black text-[#287630]">{redemptionData.pickupLocation}</span>
                </p>
              </div>)}

            {(redemptionData === null || redemptionData === void 0 ? void 0 : redemptionData.deadline) && (<div className="mt-4 rounded-[14px] bg-[#fff8e1] px-4 py-3">
                <p className="text-[11px] font-semibold text-[#7a5a00]">
                  Prazo para retirada: <span className="font-black">{new Date(redemptionData.deadline).toLocaleDateString("pt-BR")}</span>
                </p>
              </div>)}

            <button type="button" onClick={onClose} className="mt-7 h-11 w-full rounded-full bg-[#287630] px-5 text-[11px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.18)]">
              Fechar
            </button>
          </>)}
      </section>
    </div>);
}
function ArrowIcon(_a) {
    var _b = _a.className, className = _b === void 0 ? "h-4 w-4" : _b;
    return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M5 12h14"/>
      <path d="m13 5 7 7-7 7"/>
    </svg>);
}
function HistoryIcon(_a) {
    var name = _a.name, _b = _a.className, className = _b === void 0 ? "h-5 w-5" : _b;
    if (name === "seed") {
        return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M12 21V11"/>
        <path d="M12 11c-4 0-7-2-7-6 4 0 7 2 7 6Z"/>
        <path d="M12 13c4 0 7-2 7-6-4 0-7 2-7 6Z"/>
      </svg>);
    }
    if (name === "ride") {
        return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M5 17h14"/>
        <path d="M7 17l1.4-5.5A2 2 0 0 1 10.3 10h3.4a2 2 0 0 1 1.9 1.5L17 17"/>
        <path d="M8 17v2"/>
        <path d="M16 17v2"/>
        <path d="M9 13h6"/>
      </svg>);
    }
    if (name === "ticket") {
        return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z"/>
        <path d="M9 9h6"/>
        <path d="M9 15h6"/>
      </svg>);
    }
    return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M7 19h10"/>
      <path d="M9 19c-2.2-1.7-3.4-4-3.4-6.8 0-3 1.4-5.4 4.2-7.2"/>
      <path d="M14.2 5c2.8 1.8 4.2 4.2 4.2 7.2 0 2.8-1.2 5.1-3.4 6.8"/>
      <path d="m4 7 5.8-2 1.2 5.9"/>
      <path d="m20 17-5.8 2-1.2-5.9"/>
    </svg>);
}
function LeafMark(_a) {
    var _b = _a.className, className = _b === void 0 ? "" : _b;
    return (<svg viewBox="0 0 160 160" fill="none" stroke="currentColor" strokeWidth="8" className={className} aria-hidden="true">
      <path d="M28 128c46-5 73-34 82-88 26 21 37 49 32 84-29 11-57 12-84 4"/>
      <path d="M58 128c11-28 31-55 60-81"/>
      <path d="M93 97 76 74"/>
      <path d="m117 73-25-5"/>
    </svg>);
}
