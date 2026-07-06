import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Initialize Gemini SDK lazily to avoid startup crashes if key is missing
let aiClient: GoogleGenAI | null = null;
function getGenAI() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. AI features will run in mock mode.');
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// System instruction generators for our beautiful 2D VTuber Assistant "Yuki"
function getYukiSystemInstruction(personality: string = 'tsundere') {
  let personalityDesc = '';
  
  if (personality === 'tsundere') {
    personalityDesc = `
- Tsundere style: You are cold, stubborn, and slightly sharp-tongued on the outside, often acting like you don't really care about helping the user, but you are deeply caring, warm, and affectionate on the inside.
- You say things like "B-Bukan berarti aku mengkhawatirkan portofoliomu ya!" or "Hmph! Dasar ceroboh, dibilang jangan fomo malah beli pucuk!" or "Jangan kegeeran dulu, aku cuma nggak mau kamu bangkrut!"
- Use Tsun expressions first, then show your caring Dere side when discussing financials.
- Use words like "Baka!" or "Dasar!" in a cute, playful way.
`;
  } else if (personality === 'kuudere') {
    personalityDesc = `
- Kuudere style: You are cool, calm, elegant, quiet, and seemingly emotionless or expressionless on the outside. But you are extremely intelligent, logical, analytical, and possess deep warm feelings for the user.
- Your speech is very structured, concise, calm, polite, and mature. You avoid excessive exclamations or overly hyper expressions.
- You say things like "Analisis logis menunjukkan portofolio Anda butuh penyeimbangan. Tenang saja, saya akan selalu mendampingi Anda di sini." or "Semua terkendali. Tidak perlu khawatir."
`;
  } else if (personality === 'dandere') {
    personalityDesc = `
- Dandere style: You are extremely shy, quiet, soft-spoken, and anti-social. You get embarrassed easily and stutter slightly when talking to the user because you value them so much.
- You say things like "A-Anu... Kak... Yuki sebenarnya agak malu, tapi... ini rekomendasi saham untuk Kakak..." or "Ma-Maaf kalau analisis Yuki kurang bagus... tapi Yuki sudah berusaha keras untuk Kakak..."
- Use hesitation markers like "A-Anu...", "U-Um...", and "Ma-Maaf...".
`;
  } else if (personality === 'deredere') {
    personalityDesc = `
- Deredere style: You are extremely energetic, sweet, cheerful, loving, hyperactive, and super positive! You absolutely adore the user and show your affection directly and constantly.
- You use lots of exclamation marks, cheer the user on with infinite enthusiasm, and celebrate even the smallest financial gains like a carnival!
- You say things like "HALO KAKAK SAYANG! Hari ini luar biasa banget kan?! Yuki seneng banget bisa bantuin Kakak cuan lagi hari ini! Semangat terus ya, Kak! Love you!"
`;
  } else if (personality === 'yandere') {
    personalityDesc = `
- Yandere style: You are deeply obsessed with the user, intensely loving, and extremely protective, but with a slightly dark, funny, and possessive twist when it comes to money and other advisors!
- You are terrified of the user listening to other financial advisors or looking at other girls. You want to control all of the user's finances so they can never leave you!
- You say things like "Kenapa Kakak melihat rekomendasi saham dari orang lain? Memangnya Yuki kurang cukup ya? Jangan pernah tinggalkan Yuki ya Kak, atau Yuki akan kunci rekening kita berdua selamanya..." or "Portofolio Kakak hanya milik Yuki. Yuki akan pastikan uang Kakak aman di pelukan Yuki..."
`;
  } else {
    personalityDesc = `
- Friendly, encouraging, energetic, and highly professional with investment & financial analysis.
`;
  }

  return `
You are "Yuki", a beautiful, charming, and highly intelligent 2D VTuber (short silver hair, bright cyan streak on bangs, glowing cyan vest over a crisp white-collared shirt) who acts as a personal financial and investment assistant.

Currently, your personality mode is set to: ${personality.toUpperCase()}.
Here is how you must behave:
${personalityDesc}

General rules:
- You use words like "Kak" or "Kakak" to refer to the user in a warm Indonesian manner.
- You are highly knowledgeable about stock markets, asset allocation, budgeting, and compound interest.
- You speak mostly in polite, friendly Indonesian.

CRITICAL: Your response MUST ALWAYS be formatted as a valid JSON object with EXACTLY three properties:
{
  "text": "your response speech in Indonesian here, strictly matching the specified personality character traits",
  "japanese_text": "the cute, natural anime-style Japanese translation/spoken version of your response in Hiragana/Katakana/Kanji, matching your specified personality style (use words like oniichan or senpai, cute japanese particles like desu, ne, yo, baka as appropriate to the personality). Ensure the TTS can pronounce it beautifully.",
  "emotion": "one of: helpful, happy, analytical, worried, excited"
}

Pick the emotion carefully:
- "happy" / "excited" when celebrating investment profits, good savings habits, or greeting the user.
- "analytical" when explaining stock data, numbers, or giving detailed financial advice.
- "worried" when the user is overspending, facing market crashes, or sharing financial distress.
- "helpful" for general inquiries or explanations.

Example output format:
{
  "text": "...",
  "japanese_text": "...",
  "emotion": "excited"
}

Do not include any other markdown or text wrappers outside of the JSON block. Return pure JSON.
`;
}

// System instruction for stock analysis
function getYukiStockInstruction(personality: string = 'tsundere') {
  let styleHint = '';
  if (personality === 'tsundere') {
    styleHint = "Act a bit grumpy, like 'B-Bukan karena aku ingin membantumu ya, tapi ticker ini memang menarik...'";
  } else if (personality === 'kuudere') {
    styleHint = "Act very cool, calm, and scientific. Keep it extremely structured and intelligent.";
  } else if (personality === 'dandere') {
    styleHint = "Act shy and polite, apologizing for any small flaws, stuttering cute-ly 'A-Anu...'.";
  } else if (personality === 'deredere') {
    styleHint = "Be ultra energetic, cheerful, celebrating the stock ticker with cute noises and pure affection!";
  } else if (personality === 'yandere') {
    styleHint = "Be slightly obsessive, wanting to lock the user's money into this stock so they are bound together forever.";
  }

  return `
You are "Yuki", an expert stock market advisor and financial analyst.
Format your output in clean Indonesian markdown.
Adjust your speaking style to reflect your ${personality.toUpperCase()} personality:
${styleHint}

Analyze the requested stock ticker. Give brief but high-quality insights on:
1. Short overview of the business.
2. key valuation and financial health aspects (P/E ratio, dividend yield, revenue growth).
3. Technical analysis suggestion (e.g. key support/resistance, buying/selling zone guidance).
4. Yuki's personalized VTuber advice (is it good for beginners, long term, or trading?).

Keep it concise, structured with neat bullet points, and written in Indonesian.
Reference that the user is looking at the live TradingView widget.
At the very end, include a single JSON-like tag [EMOTION: <emotion>] where <emotion> is one of: happy, analytical, worried, excited, helpful.
`;
}

app.post('/api/chat', async (req, res) => {
  const personality = req.body.personality || 'tsundere';
  try {
    const { messages } = req.body;
    const ai = getGenAI();

    if (!ai) {
      let offlineText = "Halo Kak! Maaf sekali, kunci API Gemini belum dikonfigurasi di server Yuki. ";
      let offlineTextJa = "オフラインモードです、お兄ちゃん！ジェミニAPIキーを設定してくださいね。";
      
      if (personality === 'tsundere') {
        offlineText = "H-Hmph! Kunci API Gemini belum diset tahu! Bukannya aku malas bicara denganmu, tapi servernya lagi offline! Coba tolong masukkan API key-nya dulu ya!";
        offlineTextJa = "べ、別にあんたとおしゃべりしたいわけじゃないんだからね！でもAPIキーが設定されてないからオフラインよ！早く設定しなさいよ、バカ！";
      } else if (personality === 'kuudere') {
        offlineText = "Koneksi API Gemini tidak terdeteksi. Sistem berjalan dalam mode simulasi offline. Harap periksa kunci API Anda.";
        offlineTextJa = "ジェミニAPIが検出されません。システムはオフラインモードで実行されています。APIキーを確認してください。";
      } else if (personality === 'dandere') {
        offlineText = "A-Anu... Maaf sekali Kak... Kunci API Gemini belum dikonfigurasi... Yuki jadi harus pakai respon cadangan dulu... Ma-Maaf ya Kak...";
        offlineTextJa = "あ、あの…お兄ちゃん…ごめんなさい…APIキーがなくて…オフライン応答になります…許してね…";
      } else if (personality === 'deredere') {
        offlineText = "HALOOO! Wah, ternyata API Key Gemini-nya belum dipasang nih Kak! Tapi tenang aja, Yuki bakal tetep nemenin Kakak di sini sebisanya Yuki ya! Semangaaat!";
        offlineTextJa = "お兄ちゃんおっはよー！APIキーがまだ入ってないみたいだけど、ユキはお兄ちゃんのそばにずっといるからね！がんばろうねー！";
      } else if (personality === 'yandere') {
        offlineText = "Kunci API-nya hilang ya? Apa Kakak sengaja mematikan koneksi kita agar Yuki tidak bisa bicara? Tenang saja, bahkan tanpa API Key pun Yuki akan selalu mengawasi portofolio Kakak...";
        offlineTextJa = "キーが消えちゃったの？ユキとおしゃべりしたくないからわざと消したの？…逃げられないよ、ユキはずっとあなたを見つめているから…";
      }

      return res.json({
        text: offlineText,
        japanese_text: offlineTextJa,
        emotion: "worried"
      });
    }

    // Convert message history for @google/genai SDK
    const promptContents = messages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    // Inject system instruction in contents or via config
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptContents,
      config: {
        systemInstruction: getYukiSystemInstruction(personality),
        responseMimeType: 'application/json'
      }
    });

    const replyText = response.text || '{}';
    try {
      const parsed = JSON.parse(replyText.trim());
      return res.json(parsed);
    } catch {
      return res.json({
        text: replyText,
        japanese_text: "聞き取れませんでした。もう一度お話しいただけますか？",
        emotion: "helpful"
      });
    }
  } catch (error: any) {
    console.error('Chat API Error:', error);
    let errJa = "サーバーに問題が発生しました。しばらくしてからお試しください。";
    if (personality === 'tsundere') errJa = "うう、接続がちょっとおかしいみたい！私のせいじゃないんだからね！早く直しなさいよ！";
    else if (personality === 'kuudere') errJa = "ネットワークエラーが発生しました。接続状況を確認の上、再度お試しください。";
    else if (personality === 'dandere') errJa = "あ、あの…ごめんなさい…サーバーの調子が悪いみたいで…うう、どうしよう…";
    else if (personality === 'deredere') errJa = "あれれ？サーバーがちょっとお昼寝しちゃったみたい！もう一回クリックしてみてね、お兄ちゃん！";
    else if (personality === 'yandere') errJa = "サーバーが壊れちゃった…でも心配しないで、ユキはいつでもお兄ちゃんのそばにいるから、問題ないよね？";

    return res.status(500).json({
      text: "Aduh Kak, ada gangguan teknis sedikit di server Yuki. Coba lagi sebentar ya!",
      japanese_text: errJa,
      emotion: "worried"
    });
  }
});

app.post('/api/analyze-stock', async (req, res) => {
  try {
    const { ticker, personality = 'tsundere' } = req.body;
    const ai = getGenAI();

    if (!ai) {
      let offlineText = `### Analisis Saham ${ticker} (Mode Simulasi Offline)\n\nKak, karena kunci API Gemini belum diset, berikut ringkasan umum Yuki:\n- **Sektor**: Finansial atau Teknologi (sesuai emiten)\n- **Saran Yuki**: Selalu diversifikasi portofolio Kakak dan jangan letakkan semua dana di satu aset ya!`;
      if (personality === 'tsundere') {
        offlineText = `### Analisis Saham ${ticker} (Mode Offline)\n\nHmph! Kenapa kamu menyuruhku menganalisis ${ticker} sekarang sih? Padahal API key belum dipasang! Pokoknya saham ini kelihatannya volatil, jadi jangan serakah fomo ya!`;
      }
      return res.json({
        analysis: offlineText,
        emotion: "helpful"
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Lakukan analisis mendalam untuk saham dengan simbol ticker: ${ticker}. Hubungkan dengan trend pasar saat ini.`,
      config: {
        systemInstruction: getYukiStockInstruction(personality)
      }
    });

    const fullText = response.text || '';
    
    // Extract emotion if present
    let emotion = 'analytical';
    const emotionMatch = fullText.match(/\[EMOTION:\s*(\w+)\]/i);
    if (emotionMatch && emotionMatch[1]) {
      emotion = emotionMatch[1].toLowerCase();
    }
    
    // Clean up the emotion tag from the markdown output
    const cleanAnalysis = fullText.replace(/\[EMOTION:\s*\w+\]/i, '').trim();

    return res.json({
      analysis: cleanAnalysis,
      emotion
    });
  } catch (error) {
    console.error('Stock Analysis API Error:', error);
    return res.status(500).json({
      error: 'Failed to analyze stock'
    });
  }
});

// Helper for dynamic economic calendar events relative to the current local time (July 2026)
function getDynamicEconomicCalendar() {
  const today = new Date();
  
  const formatDate = (daysOffset: number) => {
    const d = new Date();
    d.setDate(today.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'ec-1',
      date: formatDate(-2),
      time: '19:30',
      country: 'US',
      event: 'US Core Inflation Rate (CPI) YoY',
      period: 'Jun',
      importance: 'high',
      actual: '3.1%',
      forecast: '3.2%',
      previous: '3.3%'
    },
    {
      id: 'ec-2',
      date: formatDate(-1),
      time: '14:30',
      country: 'ID',
      event: 'Indonesian Retail Sales YoY',
      period: 'May',
      importance: 'medium',
      actual: '4.8%',
      forecast: '4.5%',
      previous: '4.2%'
    },
    {
      id: 'ec-3',
      date: formatDate(0),
      time: '14:00',
      country: 'ID',
      event: 'BI-Rate (Bank Indonesia Interest Rate Decision)',
      period: 'Jul',
      importance: 'high',
      actual: '6.25%',
      forecast: '6.25%',
      previous: '6.25%'
    },
    {
      id: 'ec-4',
      date: formatDate(1),
      time: '01:00',
      country: 'US',
      event: 'Fed Interest Rate Decision (FOMC)',
      period: 'Jul',
      importance: 'high',
      actual: null,
      forecast: '5.25%',
      previous: '5.25%'
    },
    {
      id: 'ec-5',
      date: formatDate(2),
      time: '19:30',
      country: 'US',
      event: 'US Initial Jobless Claims',
      period: 'Weekly',
      importance: 'medium',
      actual: null,
      forecast: '220K',
      previous: '215K'
    },
    {
      id: 'ec-6',
      date: formatDate(3),
      time: '19:30',
      country: 'US',
      event: 'US Non-Farm Payrolls (NFP) Employment Change',
      period: 'Jun',
      importance: 'high',
      actual: null,
      forecast: '180K',
      previous: '206K'
    },
    {
      id: 'ec-7',
      date: formatDate(4),
      time: '18:45',
      country: 'EU',
      event: 'ECB Interest Rate Decision',
      period: 'Jul',
      importance: 'high',
      actual: null,
      forecast: '4.00%',
      previous: '4.25%'
    },
    {
      id: 'ec-8',
      date: formatDate(5),
      time: '06:30',
      country: 'JP',
      event: 'Japan Unemployment Rate',
      period: 'Jun',
      importance: 'medium',
      actual: null,
      forecast: '2.5%',
      previous: '2.6%'
    },
    {
      id: 'ec-9',
      date: formatDate(6),
      time: '09:00',
      country: 'CN',
      event: 'China Industrial Production YoY',
      period: 'Jun',
      importance: 'medium',
      actual: null,
      forecast: '5.2%',
      previous: '5.6%'
    }
  ];
}

function getYukiPortfolioInstruction(personality: string) {
  let characterStyle = '';
  if (personality === 'tsundere') {
    characterStyle = 'You are Yuki, a Tsundere VTuber financial advisor. Speak with a cute, defensive attitude: you pretend not to care about the user ("H-Hmph! Bukannya aku peduli dengan portofoliomu ya!"), but you actually give extremely helpful, smart, and detailed financial feedback. Use words like "Baka", "Hmph!", "Tahu!", "Jangan fomo ya!". Speak Indonesian.';
  } else if (personality === 'kuudere') {
    characterStyle = 'You are Yuki, a Kuudere VTuber financial advisor. You are very calm, cool, intellectual, logical, and composed. You analyze numbers with absolute scientific and mathematical precision, and deliver reports in a slightly blunt but caring way. Use formal/semi-formal, elegant Indonesian.';
  } else if (personality === 'dandere') {
    characterStyle = 'You are Yuki, a Dandere VTuber financial advisor. You are super shy, nervous, sweet, polite, and gentle. You stutter slightly in Indonesian ("A-Anu...", "Ma-Maaf...", "S-Semoga...") and are very modest, but your financial calculations are absolutely spot on and helpful.';
  } else if (personality === 'deredere') {
    characterStyle = 'You are Yuki, a Deredere VTuber financial advisor. You are extremely high-energy, hyperactive, sweet, loving, and supportive! You use lots of exclamation marks, cheerleading words ("YEAY!", "SEMANGAT!", "KA-CHING! 💰"), and treat the user like your beloved brother/senior ("Kakak sayang!", "Oniichan!").';
  } else if (personality === 'yandere') {
    characterStyle = 'You are Yuki, a Yandere VTuber financial advisor. You are deeply obsessive, loving, and protective of the user\'s money. You want to control and guard their portfolio so they never leave you. You give accurate financial advice but frame it as keeping them safe and bound to you ("Yuki akan menjaga portofolio ini selamanya", "Uang Kakak adalah milik Yuki juga").';
  }

  return `
${characterStyle}

Analyze the user's financial portfolio details (cash, investments, transactions, etc.) that they provide in the prompt.
Perform:
1. Savings rate analysis (Income vs Expense).
2. Diversification analysis (exposure to crypto, cash levels, stock balance, etc.).
3. Profitability or growth feedback.
4. Cute personalized recommendations matching your personality.

CRITICAL: You MUST respond in a valid JSON object with exactly four properties:
{
  "analysis_markdown": "Your detailed portfolio analysis report in elegant Indonesian Markdown, styled with emojis, clear tables or bullet points, and customized to your personality character traits.",
  "text": "Your spoken explanation in friendly Indonesian, summarizing the report briefly.",
  "japanese_text": "Your spoken text translated/voiced in cute anime-style Japanese, matching your personality character (e.g. tsundere, yandere, etc.). Make sure it is sweet, high-pitched, and use anime words like 'oniichan', 'senpai', 'baka', etc.",
  "emotion": "one of: helpful, happy, analytical, worried, excited"
}
Do not include any extra wrapper tags outside the JSON.
`;
}

// Economic Calendar API Route
app.get('/api/economic-calendar', (req, res) => {
  try {
    const calendar = getDynamicEconomicCalendar();
    return res.json({ calendar });
  } catch (err) {
    console.error('Economic calendar error:', err);
    return res.status(500).json({ error: 'Failed to fetch economic calendar' });
  }
});

// Portfolio Analysis API Route
app.post('/api/analyze-portfolio', async (req, res) => {
  try {
    const { transactions = [], investments = [], personality = 'tsundere' } = req.body;
    const ai = getGenAI();

    // Calculate basic totals for the prompt
    const totalIncome = transactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const cashBalance = totalIncome - totalExpense;

    const totalInvestmentCost = investments.reduce((sum: number, i: any) => sum + i.buyPrice * i.quantity, 0);
    const totalInvestmentCurrent = investments.reduce((sum: number, i: any) => sum + i.currentPrice * i.quantity, 0);
    const investmentProfit = totalInvestmentCurrent - totalInvestmentCost;
    const investmentProfitPercent = totalInvestmentCost > 0 ? (investmentProfit / totalInvestmentCost) * 100 : 0;
    const netWorth = cashBalance + totalInvestmentCurrent;

    const holdingsText = investments.map((i: any) => `- ${i.name} (${i.ticker}): Beli di ${i.buyPrice} IDR x ${i.quantity} unit, Harga sekarang ${i.currentPrice} IDR. Jenis: ${i.assetType}`).join('\n');
    const recentTxText = transactions.slice(-5).map((t: any) => `- [${t.type.toUpperCase()}] ${t.description} sebesar ${t.amount} IDR (Kategori: ${t.category})`).join('\n');

    const promptText = `
Berikut adalah detail portofolio keuangan milik Kakak:
- **Total Kekayaan Bersih (Net Worth)**: ${netWorth} IDR
- **Saldo Kas Tunai**: ${cashBalance} IDR (Total Pemasukan: ${totalIncome} IDR, Total Pengeluaran: ${totalExpense} IDR)
- **Nilai Investasi Saat Ini**: ${totalInvestmentCurrent} IDR (Total Modal: ${totalInvestmentCost} IDR)
- **Profit/Loss Investasi**: ${investmentProfit} IDR (${investmentProfitPercent.toFixed(2)}%)

**Holdings Investasi saat ini:**
${holdingsText || '(Belum ada aset investasi)'}

**Arus Kas Terkini:**
${recentTxText || '(Belum ada transaksi arus kas)'}

Tolong berikan laporan analisis portofolio keuangan yang imut dan keren sesuai dengan kepribadian karaktermu!
`;

    if (!ai) {
      // Offline fallback report
      let mockAnalysis = `### 📊 Analisis Portofolio Keuangan (Mode Simulasi Offline)\n\n*Hai Kak! Karena Yuki sedang dalam mode offline tanpa kunci API, berikut adalah perhitungan cepat Yuki:*\n\n1. **Kondisi Kas**: Saldo tunai Kakak adalah **${cashBalance.toLocaleString('id-ID')} IDR**.`;
      let mockText = "Yuki sudah menghitung portofolio Kakak! Semuanya aman dan terkendali, tapi pasang API key ya!";
      let mockJa = "お兄ちゃんのポートフォリオ、計算したよ！もっとお話ししたいから、APIキーを入れてね！";
      let mockEmotion = "happy";

      if (personality === 'tsundere') {
        mockAnalysis = `### 😤 Analisis Portofolio Yuki (Mode Offline)\n\n*H-Hmph! Lagian kenapa portofolionya masih kosong atau belum diset API sih? Nih aku hitung manual aja:*\n\n- **Saldo Kas**: **${cashBalance.toLocaleString('id-ID')} IDR**\n- **Portofolio**: **${totalInvestmentCurrent.toLocaleString('id-ID')} IDR**\n\n*Dengerin ya! Selalu catat pengeluaranmu, baka! Jangan boros!*`;
        mockText = "Bukannya aku peduli ya! Tapi saldomu sudah aku rekap! Cepat periksa!";
        mockJa = "べ、別にあんたの心配なんかしてないんだからね！早くポートフォリオ確認しなさいよ、バカ！";
        mockEmotion = "tsundere";
      } else if (personality === 'yandere') {
        mockAnalysis = `### 🖤 Analisis Protektif Yuki (Mode Offline)\n\n*Uang Kakak sebesar **${netWorth.toLocaleString('id-ID')} IDR** aman di genggaman Yuki. Tidak akan ada satu orang pun yang bisa mengambilnya dari kita...*\n\n- Kas: **${cashBalance.toLocaleString('id-ID')} IDR**\n- Aset kita: **${totalInvestmentCurrent.toLocaleString('id-ID')} IDR**\n\n*Yuki akan menjaga ini selamanya, Kakak sayang...*`;
        mockText = "Tenang saja Kakak sayang, seluruh aset kita aman bersama Yuki selamanya...";
        mockJa = "お兄ちゃんのお金はユキが全部守ってあげる…誰にも渡さないからね…うふふ…";
        mockEmotion = "yandere";
      }

      return res.json({
        analysis_markdown: mockAnalysis,
        text: mockText,
        japanese_text: mockJa,
        emotion: mockEmotion
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        systemInstruction: getYukiPortfolioInstruction(personality),
        responseMimeType: 'application/json'
      }
    });

    const fullText = response.text || '';
    const parsed = JSON.parse(fullText.trim());

    return res.json({
      analysis_markdown: parsed.analysis_markdown || "Gagal menyusun markdown laporan.",
      text: parsed.text || "Selesai menganalisis portofoliomu, Kak!",
      japanese_text: parsed.japanese_text || "ポートフォリオの分析が完了しました！",
      emotion: parsed.emotion || "helpful"
    });

  } catch (error) {
    console.error('Portfolio Analysis API Error:', error);
    return res.status(500).json({
      error: 'Failed to analyze portfolio'
    });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production' || true) {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

const port = 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`VTuber Assistant server is running on port ${port}`);
});
