import React, { useState, useEffect, useRef } from 'react';
import VtuberAvatar from './components/VtuberAvatar';
import StockAnalyzer from './components/StockAnalyzer';
import FinancePortfolio from './components/FinancePortfolio';
import EconomicCalendar from './components/EconomicCalendar';
import { Emotion, Message, Transaction, Investment, AssetType, Personality } from './types';
import {
  MessageSquare,
  TrendingUp,
  Wallet,
  Settings,
  HelpCircle,
  Volume2,
  VolumeX,
  Send,
  Zap,
  DollarSign,
  Briefcase,
  Layers,
  Sparkles,
  ArrowRight,
  Flame,
  Cpu,
  Compass,
  Heart,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Setup empty starting transactions and investments so portfolio starts completely at 0
const DEFAULT_TRANSACTIONS: Transaction[] = [];
const DEFAULT_INVESTMENTS: Investment[] = [];

const PERSONALITIES: { value: Personality; label: string; icon: string; desc: string; color: string }[] = [
  { value: 'tsundere', label: 'Tsundere', icon: '🔥', desc: 'Jual mahal tapi peduli', color: 'from-orange-500 to-red-500' },
  { value: 'kuudere', label: 'Kuudere', icon: '❄️', desc: 'Dingin & cerdas', color: 'from-blue-500 to-indigo-500' },
  { value: 'dandere', label: 'Dandere', icon: '🌸', desc: 'Pemalu & sopan', color: 'from-purple-500 to-pink-500' },
  { value: 'deredere', label: 'Deredere', icon: '✨', desc: 'Sangat ceria & manja', color: 'from-yellow-400 to-amber-500' },
  { value: 'yandere', label: 'Yandere', icon: '❤️', desc: 'Obsesif & posesif', color: 'from-red-500 to-rose-600' },
];

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'assistant' | 'market' | 'finance' | 'calendar'>('assistant');

  // Personality settings
  const [personality, setPersonality] = useState<Personality>(() => {
    const saved = localStorage.getItem('yuki_personality');
    return saved ? (saved as Personality) : 'tsundere';
  });

  // Persistence States
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('yuki_transactions');
    return saved ? JSON.parse(saved) : DEFAULT_TRANSACTIONS;
  });

  const [investments, setInvestments] = useState<Investment[]>(() => {
    const saved = localStorage.getItem('yuki_investments');
    return saved ? JSON.parse(saved) : DEFAULT_INVESTMENTS;
  });

  // Portfolio Analysis State
  const [portfolioAnalysisMarkdown, setPortfolioAnalysisMarkdown] = useState<string | null>(() => {
    return localStorage.getItem('yuki_portfolio_analysis');
  });
  const [isAnalyzingPortfolio, setIsAnalyzingPortfolio] = useState(false);

  // Assistant & Chat States
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Halo Kakak sayang! Yuki di sini siap menjadi asisten keuangan dan investasi pribadi Kakak dengan gaya trading/analis yang keren. Yuki bisa bantu kalkulasi anggaran, analisis saham dari TradingView, atau sekadar mengobrol hangat! Mau mulai dengan apa hari ini?',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      emotion: 'excited',
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [emotion, setEmotion] = useState<Emotion>('excited');
  const [isTalking, setIsTalking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Instantly cancel ongoing speech when muted
  useEffect(() => {
    if (!voiceEnabled && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsTalking(false);
    }
  }, [voiceEnabled]);

  const [isListening, setIsListening] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  // Stock Analysis state
  const [stockAnalysis, setStockAnalysis] = useState<string>('');
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  // Speech Recognition ref
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('yuki_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('yuki_investments', JSON.stringify(investments));
  }, [investments]);

  useEffect(() => {
    localStorage.setItem('yuki_personality', personality);
  }, [personality]);

  // Voice selection states
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>(() => {
    return localStorage.getItem('yuki_selected_voice_name') || '';
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load voices
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        const voicesList = window.speechSynthesis.getVoices();
        setAvailableVoices(voicesList);
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('yuki_selected_voice_name', selectedVoiceName);
  }, [selectedVoiceName]);

  // Instantly cancel ongoing TTS speech if user toggles voice to disabled/muted
  useEffect(() => {
    if (!voiceEnabled && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsTalking(false);
    }
  }, [voiceEnabled]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Helper to translate short Indonesian expressions to beautiful matching anime Japanese lines
  const getJapaneseTranslation = (text: string, currentPers: Personality): string => {
    const lowercaseText = text.toLowerCase();

    // If the text already has hiragana, katakana, or kanji, return it as-is!
    const hasJapanese = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(text);
    if (hasJapanese) {
      return text;
    }

    // Welcome message translation
    if (lowercaseText.includes('halo kakak sayang') || lowercaseText.includes('asisten keuangan') || lowercaseText.includes('lobby chat')) {
      if (currentPers === 'tsundere') {
        return "お、お兄ちゃん！ユキが投資と貯金のサポートをしてあげるわよ！べ、別にあんたのためじゃないんだからね！バカ！";
      } else if (currentPers === 'kuudere') {
        return "こんにちは。ユキです。あなたのパーソナル財務アシスタントとして、客観的な市場分析を提供します。";
      } else if (currentPers === 'dandere') {
        return "あ、あの…お兄ちゃん…ユキが、お、お金の管理をお手伝いします…うまくできるか不安だけど、頑張ります…";
      } else if (currentPers === 'deredere') {
        return "お兄ちゃんおっはよー！ユキだよ！今日もお兄ちゃんのお財布をハッピーにするために、全力で応援しちゃうよー！いぇーい！";
      } else if (currentPers === 'yandere') {
        return "お兄ちゃん、やっと会えたね…ユキがお兄ちゃんのお金を全部守ってあげる。他の人の言うことは聞いちゃダメだよ？約束ね…";
      }
      return "こんにちは、お兄ちゃん！ユキがお金のサポートをしますよ！";
    }

    // Fallback offline messages
    if (lowercaseText.includes('api gemini belum dikonfigurasi') || lowercaseText.includes('kunci api') || lowercaseText.includes('offline')) {
      if (currentPers === 'tsundere') {
        return "べ、別にあんたとおしゃべりしたいわけじゃないんだからね！でもAPIキーが設定されてないからオフラインよ！早く設定しなさいよ、バカ！";
      } else if (currentPers === 'kuudere') {
        return "ジェミニAPIが検出されません。システムはオフラインモードで実行されています。APIキーを確認してください。";
      } else if (currentPers === 'dandere') {
        return "あ、あの…お兄ちゃん…ごめんなさい…APIキーがなくて…オフライン応答になります…許してね…";
      } else if (currentPers === 'deredere') {
        return "お兄ちゃんおっはよー！APIキーがまだ入ってないみたいだけど、ユキはお兄ちゃんのそばにずっといるからね！がんばろうねー！";
      } else if (currentPers === 'yandere') {
        return "キーが消えちゃったの？ユキとおしゃべりしたくないからわざと消したの？…逃げられないよ、ユキはずっとあなたを見つめているから…";
      }
      return "オフラインモードです、お兄ちゃん！ジェミニAPIキーを設定してくださいね。";
    }

    // Fallback error messages
    if (lowercaseText.includes('gangguan teknis') || lowercaseText.includes('gangguan sedikit') || lowercaseText.includes('server yuki')) {
      if (currentPers === 'tsundere') {
        return "うう、接続がちょっとおかしいみたい！私のせいじゃないんだからね！早く直しなさいよ！";
      } else if (currentPers === 'kuudere') {
        return "ネットワークエラーが発生しました。接続状況を確認の上、再度お試しください。";
      } else if (currentPers === 'dandere') {
        return "あ、あの…ごめんなさい…サーバーの調子が悪いみたいで…うう、どうしよう…";
      } else if (currentPers === 'deredere') {
        return "あれれ？サーバーがちょっとお昼寝しちゃったみたい！もう一回クリックしてみてね、お兄ちゃん！";
      } else if (currentPers === 'yandere') {
        return "サーバーが壊れちゃった…でも心配しないで、ユキはいつでもお兄ちゃんのそばにいるから、問題ないよね？";
      }
      return "接続エラーが発生しました。しばらくしてからもう一度お試しください。";
    }

    // Simple phrase mappings
    if (lowercaseText === 'analisis portofolio' || lowercaseText.includes('portfolio analysis')) {
      return "ポートフォリオの分析を始めます！";
    }

    // Generic character expressions
    if (currentPers === 'tsundere') {
      return "ねえ、ちゃんと私の言うこと聞きなさいよ！バカ！";
    } else if (currentPers === 'kuudere') {
      return "データを詳しく分析しました。結果を確認してください。";
    } else if (currentPers === 'dandere') {
      return "あ、あの…これで合っていますか…？間違っていたらごめんなさい…";
    } else if (currentPers === 'deredere') {
      return "お兄ちゃん、すごいすごい！よくできたね！これからもずーっと一緒だよ！えへへ！";
    } else if (currentPers === 'yandere') {
      return "お兄ちゃん、私のことだけを見て。他は誰も信じちゃダメだよ…約束だからね。";
    }

    return "お兄ちゃん、ユキと一緒に頑張りましょうね！";
  };

  // Speech Synthesis (TTS) Helper with Japanese Priority Dubbing
  const speakText = (text: string, alternateJapaneseText?: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    // Cancel existing utterance
    window.speechSynthesis.cancel();

    // Prioritize natural Japanese speech for character voice dubbing
    let speechCleanText = alternateJapaneseText || '';
    if (!speechCleanText) {
      speechCleanText = getJapaneseTranslation(text, personality);
    }

    // Clean up text from raw symbols for speech
    speechCleanText = speechCleanText
      .replace(/[#*`_\[\]]/g, '')
      .replace(/\(.*?\)/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(speechCleanText);
    
    // Prioritize Japanese voice list for natural Japanese pronunciation
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = voices.find(v => v.name === selectedVoiceName);

    if (!selectedVoice) {
      // Find a Japanese voice (like Kyoko, Nanami, Haruka, Ichika, etc.)
      selectedVoice = voices.find(v => {
        const name = v.name.toLowerCase();
        const lang = v.lang.toLowerCase();
        return lang.startsWith('ja') && (
          name.includes('nanami') || name.includes('haruka') || name.includes('kyoko') || 
          name.includes('ichika') || name.includes('ayumi') || name.includes('ooto') || 
          name.includes('female') || name.includes('google') || name.includes('natural')
        );
      });
    }

    if (!selectedVoice) {
      // Find any Japanese voice
      selectedVoice = voices.find(v => v.lang.startsWith('ja'));
    }

    if (!selectedVoice) {
      // Find an Indonesian voice as fallback if Japanese is unavailable
      selectedVoice = voices.find(v => {
        const name = v.name.toLowerCase();
        const lang = v.lang.toLowerCase();
        return lang.startsWith('id') && (
          name.includes('gadis') || name.includes('female') || name.includes('zira') || 
          name.includes('susan') || name.includes('google') || name.includes('natural')
        );
      });
    }

    if (!selectedVoice) {
      // Any female voice
      selectedVoice = voices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('google'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Dynamic parameters based on cute anime girl personalities
    let currentPitch = 1.3;  // Standard cute high pitch
    let currentRate = 1.1;   // Standard energetic speed

    if (personality === 'tsundere') {
      currentPitch = 1.35;   // Slightly sharp and high pitch
      currentRate = 1.15;    // Fast and spunky
    } else if (personality === 'kuudere') {
      currentPitch = 1.12;   // Cool, analytical, slightly flatter pitch
      currentRate = 0.95;    // Calm, steady pace
    } else if (personality === 'dandere') {
      currentPitch = 1.25;   // Soft high pitch
      currentRate = 0.85;    // Hesitant, gentle, and slower
    } else if (personality === 'deredere') {
      currentPitch = 1.48;   // Super high pitch, very cute and energetic!
      currentRate = 1.22;    // Very fast, bubbly, and enthusiastic!
    } else if (personality === 'yandere') {
      currentPitch = 1.32;   // Sweet, high-pitched
      currentRate = 0.92;    // Slightly slower, intensive, and intimate
    }

    utterance.rate = currentRate;
    utterance.pitch = currentPitch;

    utterance.onstart = () => {
      setIsTalking(true);
    };

    utterance.onend = () => {
      setIsTalking(false);
    };

    utterance.onerror = () => {
      setIsTalking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Handle manual personality switch in the UI
  const handlePersonalityChange = (newPersonality: Personality) => {
    setPersonality(newPersonality);

    let switchText = '';
    let currentEmotion: Emotion = 'excited';

    if (newPersonality === 'tsundere') {
      switchText = 'H-Hmph! Jadi sekarang kamu menyuruhku bersikap tsundere? B-Bukan berarti aku senang ya, tapi dengerin nasehat keuanganku baik-baik! Dasar ceroboh!';
      currentEmotion = 'worried';
    } else if (newPersonality === 'kuudere') {
      switchText = 'Sistem kepribadian disesuaikan ke mode Kuudere. Saya akan menyajikan analisis finansial yang logis, presisi, dan objektif untuk Anda.';
      currentEmotion = 'analytical';
    } else if (newPersonality === 'dandere') {
      switchText = 'A-Anu... Halo Kak... Yuki sekarang jadi agak pemalu... Ma-Maaf kalau nanti Yuki banyak gagap ya... tapi Yuki janji bakal bantu kelola portofolio Kakak...';
      currentEmotion = 'worried';
    } else if (newPersonality === 'deredere') {
      switchText = 'YEEEY! Yuki sayang banget sama Kakak! Sekarang Yuki bakal nemenin Kakak seharian penuh dengan energi cinta dan keceriaan! Ayo kita raih cuan sama-sama, Kakak sayang!';
      currentEmotion = 'happy';
    } else if (newPersonality === 'yandere') {
      switchText = 'Akhirnya Kakak memilih kepribadian ini... Sekarang seluruh uang Kakak, portofolio Kakak, semuanya milik Yuki. Jangan pernah berpaling ke penasihat keuangan lain ya, Kak... mengerti?';
      currentEmotion = 'excited';
    }

    const systemMsg: Message = {
      id: Math.random().toString(),
      sender: 'assistant',
      text: switchText,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      emotion: currentEmotion,
    };

    setMessages((prev) => [...prev, systemMsg]);
    setEmotion(currentEmotion);
    speakText(switchText);
  };

  const handleClearAllData = () => {
    setTransactions([]);
    setInvestments([]);
    setPortfolioAnalysisMarkdown(null);
    localStorage.removeItem('yuki_transactions');
    localStorage.removeItem('yuki_investments');
    localStorage.removeItem('yuki_portfolio_analysis');
    
    let clearMsgText = 'Portofolio berhasil di-reset ke nol, Kak! Sekarang Kakak bisa memasukkan data pemasukan, pengeluaran, atau aset investasi Kakak sendiri.';
    let clearMsgJa = 'ポートフォリオがリセットされましたよ、お兄ちゃん！これから新しいデータを自由に入力してね！';
    
    if (personality === 'tsundere') {
      clearMsgText = 'Hmph! Semuanya sudah ku-reset jadi nol sesuai maumu! Sekarang buruan diisi dengan benar, jangan malas mencatat keuangan ya!';
      clearMsgJa = 'ほら、あんたの言う通り全部ゼロにしてあげたわよ！今度はちゃんと入力しなさいよね、バカ！';
    } else if (personality === 'yandere') {
      clearMsgText = 'Semuanya sudah bersih... Sekarang hanya ada Kakak dan Yuki. Mari kita bangun portofolio cinta kita dari nol bersama-sama...';
      clearMsgJa = '全部消えちゃった…これで私たちの愛のポートフォリオを、最初から一緒に作れるね、お兄ちゃん…';
    }
    
    const systemMsg: Message = {
      id: Math.random().toString(),
      sender: 'assistant',
      text: clearMsgText,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      emotion: 'happy',
    };
    setMessages((prev) => [...prev, systemMsg]);
    speakText(clearMsgText, clearMsgJa);
  };

  const handleAnalyzePortfolio = async () => {
    setIsAnalyzingPortfolio(true);
    setEmotion('analytical');
    
    // Quick spoken intro while AI computes
    let spokenWaitText = 'Tunggu sebentar ya Kak, Yuki sedang meninjau dan menghitung rincian laporan keuangan Kakak...';
    let spokenWaitJa = 'ちょっと待ってね、お兄ちゃん！今ポートフォリオのデータを集計しているからね！';
    if (personality === 'tsundere') {
      spokenWaitText = 'A-Ah, sebentar! Aku lagi memeriksa rincian belanjamu yang aneh-aneh itu! Jangan terburu-buru!';
      spokenWaitJa = 'ちょっと待ちなさいよ！あんたの無駄遣いデータをチェックしてるんだから！静かにしてて！';
    }
    speakText(spokenWaitText, spokenWaitJa);

    try {
      const res = await fetch('/api/analyze-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions,
          investments,
          personality,
        }),
      });
      if (!res.ok) throw new Error('Failed to analyze portfolio');
      const data = await res.json();
      setPortfolioAnalysisMarkdown(data.analysis_markdown);
      localStorage.setItem('yuki_portfolio_analysis', data.analysis_markdown);
      
      setEmotion(data.emotion || 'happy');
      
      // Add assistant response message to chat history so they can also read it in chat!
      const assistantMsg: Message = {
        id: Math.random().toString(),
        sender: 'assistant',
        text: `📊 **Hasil Analisis Portofolio oleh Yuki:**\n\n${data.analysis_markdown}`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        emotion: data.emotion || 'happy',
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Speak Yuki's response
      speakText(data.text, data.japanese_text);
    } catch (err) {
      console.error(err);
      let errText = "Gagal menganalisis portofoliomu saat ini, Kak. Yuki coba lagi nanti ya!";
      let errJa = "ごめんなさいお兄ちゃん、ポートフォリオの分析がうまくいかなかったみたい。また後で試してね！";
      speakText(errText, errJa);
    } finally {
      setIsAnalyzingPortfolio(false);
    }
  };

  // Keep handleSendMessage up to date
  const handleSendMessageRef = useRef(handleSendMessage);
  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  // Speech Recognition (STT) setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'id-ID';

        rec.onstart = () => {
          setIsListening(true);
          setEmotion('helpful');
        };

        rec.onresult = (event: any) => {
          const resultText = event.results[0][0].transcript;
          setInputText(resultText);
          setIsListening(false);
          // Auto submit
          handleSendMessageRef.current(resultText);
        };

        rec.onerror = (err: any) => {
          console.error('Speech recognition error:', err);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error('Failed to abort speech recognition:', e);
        }
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        console.error(e);
      }
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error('Failed to start speech recognition:', e);
          // Try resetting state or recovering if active
          setIsListening(false);
        }
      } else {
        alert('Maaf Kak, browser ini tidak mendukung pengetikan suara (Speech Recognition).');
      }
    }
  };

  // Send Message to Yuki
  async function handleSendMessage(customText?: string) {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoadingChat(true);

    try {
      // API call to our server `/api/chat` including active personality style
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          personality,
        }),
      });

      if (!response.ok) {
        throw new Error('Chat failure');
      }

      const data = await response.json();
      const assistantMsg: Message = {
        id: Math.random().toString(),
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        emotion: data.emotion || 'helpful',
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setEmotion(data.emotion || 'helpful');
      
      // Speak Yuki's response in Japanese
      speakText(data.text, data.japanese_text);
    } catch (err) {
      console.error(err);
      let errorResponse = 'Aduh Kak, server Yuki ada gangguan sedikit untuk menghubungkan dengan AI. Tapi Yuki selalu mendukung portofolio Kakak agar terus bertumbuh!';
      let errorResponseJa = 'お兄ちゃんごめんね、サーバーがちょっとおかしいみたい。でもユキはお兄ちゃんのポートフォリオが育つのを応援してるよ！';
      
      if (personality === 'tsundere') {
        errorResponse = 'C-Cepat cek koneksimu! Bukan karena aku ingin mengobrol denganmu ya, tapi servernya lagi ngambek tahu!';
        errorResponseJa = 'う、嘘でしょ、接続がおかしいわ！べ、別にあんたとお喋りしたいわけじゃないけど、早く直しなさいよね！';
      } else if (personality === 'kuudere') {
        errorResponse = 'Koneksi jaringan terganggu. Silakan periksa jaringan Anda.';
        errorResponseJa = 'ネットワークエラーが発生しました。接続状況を確認してください。';
      } else if (personality === 'dandere') {
        errorResponse = 'Ma-Maaf Kak... Server Yuki sepertinya sedang bermasalah... Maaf ya Kak...';
        errorResponseJa = 'あ、あの…お兄ちゃんごめんなさい…サーバーの調子が悪くて…うう、どうしよう…';
      } else if (personality === 'deredere') {
        errorResponse = 'Waduh! Server Yuki lagi pusing nih Kak! Tolong dicoba lagi ya, semangat!';
        errorResponseJa = 'あれれ！サーバーがパンクしちゃったみたい！もう一回やってみてね、お兄ちゃん！';
      } else if (personality === 'yandere') {
        errorResponse = 'Server kita terputus... Apakah Kakak sengaja menjauhi Yuki? Tenang saja, Yuki akan selalu bersamamu...';
        errorResponseJa = 'サーバーが切れちゃった…ユキから逃げるつもり？ダメだよ、ユキはずっとお兄ちゃんの隣にいるからね…';
      }

      const errorMsg: Message = {
        id: Math.random().toString(),
        sender: 'assistant',
        text: errorResponse,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        emotion: 'worried',
      };
      setMessages((prev) => [...prev, errorMsg]);
      setEmotion('worried');
      speakText(errorResponse, errorResponseJa);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Trigger Stock Analysis via AI
  const handleAnalyzeTicker = async (ticker: string) => {
    setIsLoadingAnalysis(true);
    setEmotion('analytical');
    setIsTalking(true);

    try {
      const response = await fetch('/api/analyze-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, personality }),
      });

      if (!response.ok) throw new Error('Analysis error');

      const data = await response.json();
      setStockAnalysis(data.analysis);
      setEmotion(data.emotion || 'analytical');

      // Speak key summary text
      const cleanTicker = ticker.split(':')[1] || ticker;
      let spokenIntro = `Berikut adalah laporan analisis Yuki untuk emiten ${cleanTicker}, Kak! Silakan dibaca dengan saksama di papan laporan keuangan kita.`;
      let spokenIntroJa = `${cleanTicker}の分析レポートができましたよ、お兄ちゃん！財務ボードをよく見てね！`;
      
      if (personality === 'tsundere') {
        spokenIntro = `Nih, analisis saham ${cleanTicker} yang kamu minta! B-Bukan karena aku peduli portofoliomu ya, cepat dibaca!`;
        spokenIntroJa = `ほら、あんたが頼んだ${cleanTicker}の分析よ！べ、別にあんたのポートフォリオなんて心配してないんだからね！早く見なさいよ！`;
      } else if (personality === 'kuudere') {
        spokenIntro = `Analisis logis untuk emiten ${cleanTicker} selesai dilakukan. Sila cek grafik serta detail valuasi di panel keuangan.`;
        spokenIntroJa = `${cleanTicker}の分析データが完了しました。ボードに表示されている結果を客観的に確認してください。`;
      } else if (personality === 'dandere') {
        spokenIntro = `A-Anu... Kak, analisis emiten ${cleanTicker} sudah Yuki kumpulkan... Semoga bisa berguna untuk investasi Kakak...`;
        spokenIntroJa = `あ、あの…お兄ちゃん、頼まれた${cleanTicker}の分析ができました…不十分だったらごめんなさい…見てくれますか？`;
      } else if (personality === 'deredere') {
        spokenIntro = `YEAY! Analisis super luar biasa untuk emiten ${cleanTicker} sudah siap nih Kak! Langsung cuss dilihat ya! Semangat cuan!`;
        spokenIntroJa = `お兄ちゃん！頼まれてた${cleanTicker}の超スペシャル分析ができたよー！今すぐボードをチェックチェックー！すごいでしょ！`;
      } else if (personality === 'yandere') {
        spokenIntro = `Analisis saham ${cleanTicker} sudah selesai. Yuki harap Kakak senang dengan analisis Yuki, dan tidak mendengarkan broker genit lainnya ya...`;
        spokenIntroJa = `${cleanTicker}の分析データだよ、お兄ちゃん。ユキ以外の言うことは信じちゃダメだからね。お金もポートフォリオも、ユキだけのものなんだから…`;
      }
      speakText(spokenIntro, spokenIntroJa);
    } catch (err) {
      console.error(err);
      setStockAnalysis('Gagal mengambil analisis pasar terkini dari Yuki.');
      setEmotion('worried');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  // Suggestions chips
  const handleSuggestionClick = (topic: string) => {
    let prompt = '';
    if (topic === 'Analyze Stocks') {
      prompt = 'Beri rekomendasi emiten saham Blue Chip IDX yang bagus dibeli bulan ini!';
    } else if (topic === 'Savings Tip') {
      prompt = 'Yuki, berikan tips cara membagi gaji bulanan agar tabungan dan investasi tetap aman!';
    } else if (topic === 'My Portfolio') {
      prompt = `Yuki, tolong evaluasi portofolio investasi saya. Saya punya saham senilai ${investments.reduce((sum, i) => sum + i.currentPrice * i.quantity, 0)} rupiah.`;
    }
    handleSendMessage(prompt);
  };

  return (
    <div className="min-h-screen bg-[#0f0c29] text-white font-sans overflow-y-auto flex flex-col justify-between" style={{ background: 'linear-gradient(135deg, #07051a 0%, #17113c 50%, #1c1032 100%)' }}>
      
      {/* Dynamic Background Glass Spheres */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Wrapper */}
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col p-4 md:p-6 gap-6 relative z-10">
        
        {/* Header Applet Bar */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-white/5 backdrop-blur-2xl border border-white/10 px-6 py-4 rounded-3xl shadow-xl gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Zap className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold tracking-widest text-cyan-300 uppercase">YUKI V-FINANCE</h1>
                <span className="text-[9px] font-mono font-bold bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded uppercase">VTuber Advisor</span>
              </div>
              <p className="text-[10px] text-white/50">Asisten Keuangan Interaktif & Grafik Saham Live</p>
            </div>
          </div>

          {/* Personality Switcher Section (As requested by User!) */}
          <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-1.5 rounded-2xl">
            <span className="text-[9px] font-mono text-white/50 uppercase tracking-wider hidden sm:inline">Set Sifat Yuki:</span>
            <div className="flex flex-wrap gap-1">
              {PERSONALITIES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => handlePersonalityChange(p.value)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                    personality === p.value
                      ? 'bg-gradient-to-r ' + p.color + ' text-white shadow shadow-white/10'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                  title={p.desc}
                >
                  <span>{p.icon}</span>
                  <span className="capitalize">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats overview */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="text-right">
              <span className="text-[9px] text-white/40 block font-mono">SALDO TUNAI</span>
              <span className="text-xs font-mono font-bold text-green-400">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(
                  transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) -
                  transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
                )}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-white/40 block font-mono">PORTFOLIO</span>
              <span className="text-xs font-mono font-bold text-teal-400">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(
                  investments.reduce((sum, i) => sum + i.currentPrice * i.quantity, 0)
                )}
              </span>
            </div>
          </div>
        </header>

        {/* Content Frame */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Navigation Sidebar (Vertical Rail) */}
          <nav className="col-span-1 lg:col-span-1 flex flex-row lg:flex-col items-center justify-between lg:justify-start py-4 lg:py-8 px-4 lg:px-0 gap-4 lg:gap-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-lg">
            {/* Nav top icon */}
            <div className="hidden lg:flex w-11 h-11 bg-white/5 rounded-2xl items-center justify-center border border-white/10">
              <Briefcase className="w-5 h-5 text-indigo-400" />
            </div>

            {/* Nav Selection Buttons */}
            <div className="flex flex-row lg:flex-col gap-3 lg:gap-6 w-full lg:px-2 items-center justify-center">
              <button
                id="nav-tab-assistant"
                onClick={() => setActiveTab('assistant')}
                className={`p-3 rounded-2xl flex items-center justify-center transition-all w-12 h-12 cursor-pointer ${
                  activeTab === 'assistant'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
                title="Lobby Chat VTuber Yuki"
              >
                <MessageSquare className="w-5 h-5" />
              </button>

              <button
                id="nav-tab-market"
                onClick={() => setActiveTab('market')}
                className={`p-3 rounded-2xl flex items-center justify-center transition-all w-12 h-12 cursor-pointer ${
                  activeTab === 'market'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
                title="TradingView Live Market"
              >
                <TrendingUp className="w-5 h-5" />
              </button>

              <button
                id="nav-tab-finance"
                onClick={() => setActiveTab('finance')}
                className={`p-3 rounded-2xl flex items-center justify-center transition-all w-12 h-12 cursor-pointer ${
                  activeTab === 'finance'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
                title="Pengelola Keuangan Pribadi"
              >
                <Wallet className="w-5 h-5" />
              </button>

              <button
                id="nav-tab-calendar"
                onClick={() => setActiveTab('calendar')}
                className={`p-3 rounded-2xl flex items-center justify-center transition-all w-12 h-12 cursor-pointer ${
                  activeTab === 'calendar'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
                title="Kalender Ekonomi Makro"
              >
                <Calendar className="w-5 h-5" />
              </button>
            </div>

            {/* Nav bottom voice controls */}
            <div className="flex lg:mt-auto items-center justify-center">
              <button
                id="sidebar-tts-toggle"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-2.5 rounded-full transition-all cursor-pointer ${
                  voiceEnabled ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/40' : 'text-white/30 bg-white/5'
                }`}
                title="Toggle Voice"
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </nav>

          {/* Center Column: VTuber Interactive Zone (Left Column) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <VtuberAvatar
              emotion={emotion}
              isTalking={isTalking}
              voiceEnabled={voiceEnabled}
              setVoiceEnabled={setVoiceEnabled}
              onMicClick={toggleListening}
              isListening={isListening}
              personality={personality}
            />

            {/* Micro Chat/Interactive history logs box below avatar */}
            <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 relative overflow-hidden flex flex-col justify-between min-h-[250px]">
              <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#17113c]/30 to-transparent pointer-events-none" />
              <span className="text-[10px] tracking-widest text-indigo-300 font-bold uppercase font-mono mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-pink-400" /> Log Interaksi Terakhir
              </span>

              {/* Minimalist beautiful recent logs */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin my-2 max-h-56">
                {messages.slice(-3).map((m) => (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-xl border text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-white/5 border-white/5 text-white/70 ml-6'
                        : 'bg-black/35 border-white/10 text-white shadow-sm mr-2'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-[9px] text-cyan-400 font-mono">
                        {m.sender === 'user' ? 'Kakak' : 'Yuki'}
                      </span>
                      <span className="text-[8px] text-white/30 font-mono">{m.timestamp}</span>
                    </div>
                    <p className="font-sans text-white/90">{m.text}</p>
                  </div>
                ))}
              </div>

              <div className="h-0.5 bg-white/5 w-full my-1" />
              
              {/* Voice Selector Dropdown */}
              <div className="my-2 pt-2 border-t border-white/5">
                <label className="text-[10px] tracking-wider text-pink-400 font-bold uppercase font-mono mb-1 flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-pink-400 animate-pulse" /> Pengaturan Suara Yuki
                </label>
                <select
                  id="voice-select-dropdown"
                  value={selectedVoiceName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedVoiceName(val);
                    // Test voice by saying a brief greeting in cute Japanese!
                    setTimeout(() => {
                      if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
                      window.speechSynthesis.cancel();
                      
                      let previewText = "お兄ちゃん！新しいユキの声、どうかな？気に入ってくれた？";
                      if (personality === 'tsundere') {
                        previewText = "べ、別にあんたのために喋ってるわけじゃないんだからね！気に入った？";
                      } else if (personality === 'kuudere') {
                        previewText = "新しい音声プロファイルです。聞き取りやすさに問題はありませんか？";
                      } else if (personality === 'dandere') {
                        previewText = "あ、あの…お兄ちゃん、ユキの新しい声…変じゃないかな…？";
                      } else if (personality === 'deredere') {
                        previewText = "お兄ちゃんお兄ちゃん！ユキの新しい声だよ！めっちゃ可愛いでしょー！";
                      } else if (personality === 'yandere') {
                        previewText = "お兄ちゃん、ユキの声、ずっと耳の奥に響かせてあげるね。他は聞かないで…";
                      }

                      const previewUtterance = new SpeechSynthesisUtterance(previewText);
                      const vList = window.speechSynthesis.getVoices();
                      let chosen = vList.find(v => v.name === val);
                      
                      if (!chosen) {
                        // Fallback to auto Japanese voice if test is clicked on default
                        chosen = vList.find(v => {
                          const name = v.name.toLowerCase();
                          const lang = v.lang.toLowerCase();
                          return lang.startsWith('ja') && (
                            name.includes('nanami') || name.includes('haruka') || name.includes('kyoko') ||
                            name.includes('ichika') || name.includes('ayumi') || name.includes('ooto') ||
                            name.includes('female') || name.includes('google') || name.includes('natural')
                          );
                        }) || vList.find(v => v.lang.startsWith('ja'));
                      }

                      if (chosen) {
                        previewUtterance.voice = chosen;
                      }
                      
                      // Dynamic pitch based on cute personality
                      let currentPitch = 1.35;
                      let currentRate = 1.1;
                      if (personality === 'tsundere') { currentPitch = 1.35; currentRate = 1.15; }
                      else if (personality === 'kuudere') { currentPitch = 1.12; currentRate = 0.95; }
                      else if (personality === 'dandere') { currentPitch = 1.25; currentRate = 0.85; }
                      else if (personality === 'deredere') { currentPitch = 1.48; currentRate = 1.22; }
                      else if (personality === 'yandere') { currentPitch = 1.32; currentRate = 0.92; }
                      
                      previewUtterance.pitch = currentPitch;
                      previewUtterance.rate = currentRate;
                      
                      previewUtterance.onstart = () => setIsTalking(true);
                      previewUtterance.onend = () => setIsTalking(false);
                      previewUtterance.onerror = () => setIsTalking(false);
                      window.speechSynthesis.speak(previewUtterance);
                    }, 100);
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-1.5 text-[11px] text-white/80 focus:ring-1 focus:ring-pink-500 focus:outline-none scrollbar-thin cursor-pointer"
                >
                  <option value="" className="bg-slate-950 text-white">Default (Bahasa Jepang Otomatis)</option>
                  {availableVoices
                    .filter(v => {
                      const name = v.name.toLowerCase();
                      const lang = v.lang.toLowerCase();
                      return lang.startsWith('ja') || lang.startsWith('id') || lang.startsWith('en');
                    })
                    .map((v) => (
                      <option key={v.name} value={v.name} className="bg-slate-950 text-white">
                        {v.name} ({v.lang}) {v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('susan') || v.name.toLowerCase().includes('gadis') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('nanami') || v.name.toLowerCase().includes('haruka') || v.name.toLowerCase().includes('kyoko') ? '♀️' : ''}
                      </option>
                    ))
                  }
                </select>
                <p className="text-[8px] text-white/40 mt-1 font-mono">
                  *Pilih suara perempuan Jepang (♀️ ja-JP) untuk nada anime yang sangat manis dan tinggi!
                </p>
              </div>

              <div className="text-[9px] text-white/40 flex justify-between items-center font-mono">
                <span>Modul kepribadian: {personality.toUpperCase()}</span>
                <span className="text-cyan-400">Aktif</span>
              </div>
            </div>
          </div>

          {/* Center-Right Column: Live Modules Tab Contents */}
          <div className="lg:col-span-7 flex flex-col">
            <AnimatePresence mode="wait">
              {activeTab === 'assistant' && (
                <motion.div
                  key="assistant-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 flex flex-col h-full min-h-[500px]"
                >
                  <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-pink-400" /> Ruang Obrolan Yuki AI
                    </h3>
                    <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-800/40 px-2 py-0.5 rounded-full capitalize">
                      Sifat: {personality}
                    </span>
                  </div>

                  {/* Chat message display area */}
                  <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin max-h-[350px]">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex flex-col max-w-[85%] ${
                          m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                        }`}
                      >
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed font-sans ${
                            m.sender === 'user'
                              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none shadow-md shadow-indigo-600/10'
                              : 'bg-black/40 border border-white/10 text-white/95 rounded-bl-none shadow-lg shadow-black/20'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.text}</p>
                        </div>
                        <span className="text-[8px] text-white/30 font-mono mt-1 px-1">{m.timestamp}</span>
                      </div>
                    ))}
                    {isLoadingChat && (
                      <div className="bg-black/30 border border-white/5 px-4 py-2.5 rounded-2xl rounded-bl-none max-w-[85%] text-xs text-white/50 flex items-center gap-2">
                        <svg className="animate-spin h-3.5 w-3.5 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Yuki sedang menyusun jawaban...
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Dynamic Help suggestions chips */}
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <span className="text-[10px] text-white/40 block mb-2 font-mono">TANYA YUKI:</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleSuggestionClick('Analyze Stocks')}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1 text-[10px] text-white/70 transition-all cursor-pointer font-sans"
                      >
                        Saham Bagus Bulan Ini 📈
                      </button>
                      <button
                        onClick={() => handleSuggestionClick('Savings Tip')}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1 text-[10px] text-white/70 transition-all cursor-pointer font-sans"
                      >
                        Bagi Porsi Gaji 💰
                      </button>
                      <button
                        onClick={() => handleSuggestionClick('My Portfolio')}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1 text-[10px] text-white/70 transition-all cursor-pointer font-sans"
                      >
                        Analisis Portofolioku 📊
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'market' && (
                <motion.div
                  key="market-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1"
                >
                  <StockAnalyzer
                    onAnalyzeTicker={handleAnalyzeTicker}
                    isLoadingAnalysis={isLoadingAnalysis}
                    aiAnalysisOutput={stockAnalysis}
                  />
                </motion.div>
              )}

              {activeTab === 'finance' && (
                <motion.div
                  key="finance-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1"
                >
                  <FinancePortfolio
                    transactions={transactions}
                    investments={investments}
                    onAddTransaction={(tx) => {
                      const newTx = { ...tx, id: Math.random().toString() };
                      setTransactions((prev) => [...prev, newTx]);
                    }}
                    onDeleteTransaction={(id) => {
                      setTransactions((prev) => prev.filter((t) => t.id !== id));
                    }}
                    onUpdateTransaction={(updatedTx) => {
                      setTransactions((prev) => prev.map((t) => (t.id === updatedTx.id ? updatedTx : t)));
                    }}
                    onAddInvestment={(inv) => {
                      const newInv = { ...inv, id: Math.random().toString() };
                      setInvestments((prev) => [...prev, newInv]);
                    }}
                    onDeleteInvestment={(id) => {
                      setInvestments((prev) => prev.filter((i) => i.id !== id));
                    }}
                    onUpdateInvestment={(updatedInv) => {
                      setInvestments((prev) => prev.map((i) => (i.id === updatedInv.id ? updatedInv : i)));
                    }}
                    onClearAllData={handleClearAllData}
                    onAnalyzePortfolio={handleAnalyzePortfolio}
                    isAnalyzingPortfolio={isAnalyzingPortfolio}
                    portfolioAnalysisMarkdown={portfolioAnalysisMarkdown}
                  />
                </motion.div>
              )}

              {activeTab === 'calendar' && (
                <motion.div
                  key="calendar-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1"
                >
                  <EconomicCalendar />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Global Chat / Interaction Bar at Bottom */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full flex items-center px-6 py-2 gap-4 shadow-2xl mt-4">
          <button
            id="mic-footer-btn"
            onClick={toggleListening}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
            title="Ketik dengan suara"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          <input
            id="global-chat-input"
            type="text"
            placeholder={isListening ? "Katakan sesuatu pada Yuki..." : "Tanya apa saja tentang keuangan atau analisa emiten pada Yuki..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-white/30 text-sm focus:outline-none"
          />

          <button
            id="global-chat-send-btn"
            onClick={() => handleSendMessage()}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-900 hover:bg-slate-200 transition-colors cursor-pointer shadow-lg"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
