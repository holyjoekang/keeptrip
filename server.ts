import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google GenAI if key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({ apiKey });
}

// Fallback intelligent responses for common travel queries
const FALLBACK_KNOWLEDGE_BASE: Record<string, string> = {
  alipay_toss: `[2026 최신 알리페이 & 토스/트래블카드 정책 요약]
1. 200위안 기준 수수료:
   - 알리페이에 등록된 해외 카드(비자/마스터)는 건당 200위안(약 38,000원) 초과 결제 시 알리페이 자체 3% 수수료가 가산됩니다.
   - 200위안 이하 결제는 알리페이 수수료가 원칙적으로 면제되지만, 결제 건당 최소 수수료를 부과하는 특정 가맹점이 간혹 있으므로 주의가 필요합니다.
2. 토스뱅크 / 트래블로그 / 트래블월렛 연결 팁:
   - 트래블로그(하나)나 트래블월렛을 위안화(CNY)로 미리 환전해 충전해두고 알리페이에 등록하면 해외이용 수수료(1.2%)가 0원입니다.
   - 200위안 초과 결제 시에도 트래블카드를 연결하면 카드사 수수료는 0%이며, 알리페이 3%만 붙습니다.
   - 식당 등에서 200위안 초과 시 일행과 2개 이상의 계정으로 분할 결제를 요청(AA제 분할)하면 3% 수수료를 완벽히 피할 수 있습니다!
3. 여권 실명인증:
   - 출국 최소 2~3일 전 알리페이 [Account] -> [Identity Verification]에서 여권 사진을 업로드해 승인을 받아두어야 현지 첫 결제 시 계정 잠김(블록) 현상이 발생하지 않습니다.`,

  grab_wallet: `[2026 최신 말레이시아 그랩(Grab) 결제 최적화 팁]
1. 일반 신용카드 직결제 (비추천):
   - 그랩에 국내 일반 신용카드를 직접 등록해 승인하면, 카드사 해외원화결제(DCC) 또는 해외 이용 수수료로 약 2.5%~3%가 자동 추가됩니다.
2. 그랩페이 지갑(GrabPay Wallet) 충전 (적극 추천):
   - 그랩 앱 메인 화면의 [Top Up]을 눌러 트래블로그, 트래블월렛, 또는 토스 체크카드로 50~100링깃(약 1.5만~3만원)씩 필요할 때마다 충전하세요.
   - 지갑 충전 시에는 해외 수수료가 0%로 처리되어 탑승 시마다 3% 수수료를 깔끔하게 아낄 수 있습니다.
3. 1~2천원 아끼기 vs 피로도 판단:
   - KL 공항에서 시내로 이동(약 65~75링깃)하거나 하루 1~2회 단거리 이동 시 수수료 차이는 하루 1,000원~2,000원 미만입니다.
   - 카드 발급이 번거로우시다면 기존 카드로 타셔도 총비용에 큰 차이는 없으나, 7박 8일간 15회 이상 탑승 예정이라면 월렛 충전 방식을 추천합니다!`,

  china_esim: `[중국 여행 eSIM vs 유심 vs 로밍 완벽 비교]
1. 왜 중국에서는 '로밍형 eSIM'이 필수인가?
   - 중국 현지 유심(China Mobile/Unicom)이나 호텔 와이파이를 쓰면 중국 만리방화벽(Golden Shield) 때문에 카카오톡, 유튜브, 인스타그램, 구글 지도, 네이버 블로그가 전면 차단됩니다.
   - 한국 통신사 망이나 홍콩/마카오 망을 경유하는 여행자용 eSIM(로밍형)을 구매하면, 번거롭고 느린 유료 VPN 앱 없이도 한국처럼 모든 앱이 정상 작동합니다!
2. 비용 비교:
   - 통신사 자동 로밍: 1일 9,900원 x 5일 = 약 49,500원
   - 여행자용 eSIM: 일일 2~3GB 기준 5일권 약 11,000원~14,000원
   - 무려 35,000원 이상 아끼며 동일한 초고속 데이터망을 쓸 수 있습니다.`
};

// API: AI Travel Advisor
app.post('/api/ask-advisor', async (req: Request, res: Response) => {
  try {
    const { question, destination, context } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (aiClient) {
      try {
        const prompt = `You are a real-world smart travel fee & practical optimizer assistant for Korean travelers (나만의 여행 가이드).
Your philosophy:
- "아낄 건 확실하게 아끼고, 1~2천원 차이로 피곤해질 건 과감히 무시하는 실용주의 최적화"
- Provide accurate, up-to-date fee advice (Alipay 200 RMB rule, Grab 3% card fee vs GrabPay Wallet top-up, eSIM vs Roaming cost & VPN bypass for China, Toss Bank / TravelWallet / TravelLog benefits).
- Always reply in friendly, clear Korean with structured bullet points and practical action items.

User Context:
Destination: ${destination || 'Global'}
Additional Info: ${context || 'None'}

User Question: ${question}`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text || '';
        return res.json({ answer: text, source: 'gemini-live' });
      } catch (aiErr) {
        console.warn('Gemini API call failed, falling back to local knowledge base:', aiErr);
      }
    }

    // Local fallback matching
    const qLower = (question || '').toLowerCase();
    let bestFallback = '';

    if (qLower.includes('그랩') || qLower.includes('grab') || qLower.includes('말레이') || qLower.includes('페낭') || qLower.includes('지갑') || qLower.includes('월렛') || qLower.includes('택시')) {
      bestFallback = FALLBACK_KNOWLEDGE_BASE.grab_wallet;
    } else if (qLower.includes('이심') || qLower.includes('esim') || qLower.includes('로밍') || qLower.includes('도시락') || qLower.includes('vpn') || qLower.includes('와이파이')) {
      bestFallback = FALLBACK_KNOWLEDGE_BASE.china_esim;
    } else if (qLower.includes('알리페이') || qLower.includes('토스') || qLower.includes('중국') || qLower.includes('200위안') || qLower.includes('수수료') || qLower.includes('위안')) {
      bestFallback = FALLBACK_KNOWLEDGE_BASE.alipay_toss;
    } else {
      bestFallback = `[실시간 여행 최적화 가이드 답변]
- 여행지: ${destination || '해외'}
- 질문: "${question}"에 대한 최적화 권장사항:
1. 결제/환전: 현지 화폐 직접 현금 환전은 최소화하고, 수수료 0% 트래블카드(트래블로그/월렛/토스체크)를 현지 모바일 페이(알리페이, 그랩 등)에 연동하는 것이 가장 안전하고 수수료를 아끼는 방법입니다.
2. 예산 대비 피로도: 1,000~2,000원 아끼기 위해 복잡한 절차나 새 계좌 개설이 필요한 경우 과감히 기존 카드를 이용하세요. 반면 3% 이상 고율 수수료가 누적되는 반복 지출(그랩, 고액 식당 등)은 월렛 충전이나 분할 결제를 적용하세요.
3. 통신: 스마트폰이 지원한다면 eSIM이 통신사 로밍 대비 70% 이상 저렴하며 분실 위험도 없습니다.`;
    }

    return res.json({ answer: bestFallback, source: 'knowledge-base' });
  } catch (error) {
    console.error('Server error in /api/ask-advisor:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Setup Vite in Dev or serve static in Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
