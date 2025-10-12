// services/elevenLabsService.ts

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

interface ElevenLabsOptions {
  text: string;
  voiceId: string;
  languageCode?: string;
  volume?: number;
  stability?: number;
  similarityBoost?: number;
  isMuted?: boolean;
}

export const speakText = async (options: ElevenLabsOptions): Promise<void> => {
  const {
    text,
    voiceId,
    languageCode = 'en',
    volume = 1.0,
    stability = 0.5,
    similarityBoost = 0.75,
    isMuted = false,
  } = options;

  // Don't play if muted
  if (isMuted) {
    console.log("Voice is muted");
    return Promise.resolve();
  }

  if (!ELEVENLABS_API_KEY) {
    console.error("ElevenLabs API key not found");
    return;
  }

  try {
    // ✅ FIXED: Define the URL
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2', // Changed to multilingual for language support
        voice_settings: {
          stability: stability,
          similarity_boost: similarityBoost,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Play audio with volume control
    const audio = new Audio(audioUrl);
    audio.volume = volume;
    
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        reject(error);
      };
      audio.play().catch(reject);
    });
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};

// Helper function for upload message
export const speakUploadMessage = (voiceId: string, languageCode: string, volume: number, isMuted: boolean) => {
  const messages: Record<string, string> = {
    en: "Oh I LOVE your style! Let's see what we can do for you today.",
    es: "¡Oh, ME ENCANTA tu estilo! Veamos qué podemos hacer por ti hoy.",
    fr: "Oh j'ADORE votre style! Voyons ce que nous pouvons faire pour vous aujourd'hui.",
    de: "Oh ich LIEBE deinen Stil! Mal sehen, was wir heute für dich tun können.",
    it: "Oh ADORO il tuo stile! Vediamo cosa possiamo fare per te oggi.",
    pt: "Oh eu AMO seu estilo! Vamos ver o que podemos fazer por você hoje.",
    pl: "Och UWIELBIAM twój styl! Zobaczmy, co możemy dla ciebie zrobić dzisiaj.",
    zh: "哦，我喜欢你的风格！让我们看看今天能为你做些什么。",
    ja: "ああ、あなたのスタイル大好き！今日は何ができるか見てみましょう。",
    ko: "오, 당신의 스타일이 정말 마음에 들어요! 오늘 무엇을 할 수 있는지 봅시다.",
  };

  return speakText({
    text: messages[languageCode] || messages.en,
    voiceId,
    languageCode,
    volume,
    isMuted,
    stability: 0.6,
    similarityBoost: 0.8,
  });
};

// Helper function for trend prediction results
export const speakTrendResults = (
  trends: Array<{trendName: string; recommendations: string[]}>,
  voiceId: string,
  languageCode: string,
  volume: number,
  isMuted: boolean
) => {
  if (trends.length < 4) {
    console.error("Need at least 4 trends");
    return Promise.resolve();
  }

  const scripts: Record<string, string> = {
    en: `Based on your vibe, I'm seeing ${trends[0].trendName}, ${trends[1].trendName}, ${trends[2].trendName}, and ${trends[3].trendName}. How perfectly curated is that? To capture this look, I recommend investing in key pieces like ${trends[0].recommendations[0]}, ${trends[1].recommendations[0]}, ${trends[2].recommendations[0]}, and ${trends[3].recommendations[0]}. I've curated the perfect shops for your vibe so you can be your most fashion-forward self.`,
    es: `Según tu vibra, veo ${trends[0].trendName}, ${trends[1].trendName}, ${trends[2].trendName}, y ${trends[3].trendName}. ¿Qué tan perfectamente seleccionado es eso? Para capturar este look, recomiendo invertir en piezas clave como ${trends[0].recommendations[0]}, ${trends[1].recommendations[0]}, ${trends[2].recommendations[0]}, y ${trends[3].recommendations[0]}. He seleccionado las tiendas perfectas para tu estilo.`,
    fr: `D'après votre style, je vois ${trends[0].trendName}, ${trends[1].trendName}, ${trends[2].trendName}, et ${trends[3].trendName}. C'est parfaitement sélectionné! Pour capturer ce look, je recommande d'investir dans des pièces clés comme ${trends[0].recommendations[0]}, ${trends[1].recommendations[0]}, ${trends[2].recommendations[0]}, et ${trends[3].recommendations[0]}. J'ai sélectionné les boutiques parfaites pour votre style.`,
    de: `Nach deiner Stimmung sehe ich ${trends[0].trendName}, ${trends[1].trendName}, ${trends[2].trendName}, und ${trends[3].trendName}. Wie perfekt kuratiert ist das? Um diesen Look einzufangen, empfehle ich in Schlüsselstücke wie ${trends[0].recommendations[0]}, ${trends[1].recommendations[0]}, ${trends[2].recommendations[0]}, und ${trends[3].recommendations[0]} zu investieren.`,
    it: `Secondo il tuo stile, vedo ${trends[0].trendName}, ${trends[1].trendName}, ${trends[2].trendName}, e ${trends[3].trendName}. Quanto è perfettamente curato? Per catturare questo look, consiglio di investire in pezzi chiave come ${trends[0].recommendations[0]}, ${trends[1].recommendations[0]}, ${trends[2].recommendations[0]}, e ${trends[3].recommendations[0]}.`,
    pt: `Baseado no seu estilo, vejo ${trends[0].trendName}, ${trends[1].trendName}, ${trends[2].trendName}, e ${trends[3].trendName}. Quão perfeitamente selecionado é isso? Para capturar este visual, recomendo investir em peças-chave como ${trends[0].recommendations[0]}, ${trends[1].recommendations[0]}, ${trends[2].recommendations[0]}, e ${trends[3].recommendations[0]}.`,
    pl: `Na podstawie twojego stylu widzę ${trends[0].trendName}, ${trends[1].trendName}, ${trends[2].trendName}, i ${trends[3].trendName}. Jak perfekcyjnie wyselekcjonowane! Aby uchwycić ten wygląd, polecam zainwestować w kluczowe elementy jak ${trends[0].recommendations[0]}, ${trends[1].recommendations[0]}, ${trends[2].recommendations[0]}, i ${trends[3].recommendations[0]}.`,
    zh: `根据你的风格，我看到${trends[0].trendName}、${trends[1].trendName}、${trends[2].trendName}和${trends[3].trendName}。多么完美的策划！为了捕捉这种造型，我建议投资关键单品，如${trends[0].recommendations[0]}、${trends[1].recommendations[0]}、${trends[2].recommendations[0]}和${trends[3].recommendations[0]}。`,
    ja: `あなたの雰囲気から、${trends[0].trendName}、${trends[1].trendName}、${trends[2].trendName}、${trends[3].trendName}が見えます。完璧にキュレーションされていますね！このルックを実現するには、${trends[0].recommendations[0]}、${trends[1].recommendations[0]}、${trends[2].recommendations[0]}、${trends[3].recommendations[0]}などの重要なアイテムへの投資をお勧めします。`,
    ko: `당신의 분위기를 보니 ${trends[0].trendName}, ${trends[1].trendName}, ${trends[2].trendName}, ${trends[3].trendName}이 보입니다. 얼마나 완벽하게 큐레이션되었나요? 이 룩을 완성하려면 ${trends[0].recommendations[0]}, ${trends[1].recommendations[0]}, ${trends[2].recommendations[0]}, ${trends[3].recommendations[0]}와 같은 핵심 아이템에 투자하는 것을 추천합니다.`,
  };

  return speakText({
    text: scripts[languageCode] || scripts.en,
    voiceId,
    languageCode,
    volume,
    isMuted,
    stability: 0.5,
    similarityBoost: 0.75,
  });
};

export default { speakText, speakUploadMessage, speakTrendResults };