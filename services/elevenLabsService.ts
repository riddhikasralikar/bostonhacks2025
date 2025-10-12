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
        model_id: 'eleven_multilingual_v2',
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

// Helper function for seasonal forecast
export const speakSeasonalForecast = (
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
    en: `Let's dive into this upcoming season's hottest trends! This season, we're absolutely obsessed with ${trends[0].trendName}, ${trends[1].trendName}, ${trends[2].trendName}, and ${trends[3].trendName}. Some must-have pieces to focus on? Think ${trends[0].recommendations[0]}, ${trends[1].recommendations[0]}, ${trends[2].recommendations[0]}, and ${trends[3].recommendations[0]}. Trust me, these are going to be everywhere.`,
    es: `¡Vamos a sumergirnos en las tendencias más calientes de esta próxima temporada! Esta temporada, estamos absolutamente obsesionados con ${trends[0].trendName}, ${trends[1].trendName}, ${trends[2].trendName}, y ${trends[3].trendName}. ¿Algunas piezas imprescindibles en las que centrarse? Piensa en ${trends[0].recommendations[0]}, ${trends[1].recommendations[0]}, ${trends[2].recommendations[0]}, y ${trends[3].recommendations[0]}.`,
    fr: `Plongeons dans les tendances les plus en vogue de la saison à venir! Cette saison, nous sommes absolument obsédés par ${trends[0].trendName}, ${trends[1].trendName}, ${trends[2].trendName}, et ${trends[3].trendName}. Quelques pièces incontournables? Pensez à ${trends[0].recommendations[0]}, ${trends[1].recommendations[0]}, ${trends[2].recommendations[0]}, et ${trends[3].recommendations[0]}.`,
    de: `Lass uns in die heißesten Trends der kommenden Saison eintauchen! Diese Saison sind wir absolut besessen von ${trends[0].trendName}, ${trends[1].trendName}, ${trends[2].trendName}, und ${trends[3].trendName}. Einige Must-Have-Stücke? Denk an ${trends[0].recommendations[0]}, ${trends[1].recommendations[0]}, ${trends[2].recommendations[0]}, und ${trends[3].recommendations[0]}.`,
    it: `Tuffiamoci nelle tendenze più calde della prossima stagione! Questa stagione, siamo assolutamente ossessionati da ${trends[0].trendName}, ${trends[1].trendName}, ${trends[2].trendName}, e ${trends[3].trendName}. Alcuni pezzi imperdibili? Pensa a ${trends[0].recommendations[0]}, ${trends[1].recommendations[0]}, ${trends[2].recommendations[0]}, e ${trends[3].recommendations[0]}.`,
    pt: `Vamos mergulhar nas tendências mais quentes da próxima temporada! Esta temporada, estamos absolutamente obcecados com ${trends[0].trendName}, ${trends[1].trendName}, ${trends[2].trendName}, e ${trends[3].trendName}. Algumas peças indispensáveis? Pense em ${trends[0].recommendations[0]}, ${trends[1].recommendations[0]}, ${trends[2].recommendations[0]}, e ${trends[3].recommendations[0]}.`,
    pl: `Zanurzmy się w najgorętszych trendach nadchodzącego sezonu! W tym sezonie jesteśmy absolutnie obsesyjni na punkcie ${trends[0].trendName}, ${trends[1].trendName}, ${trends[2].trendName}, i ${trends[3].trendName}. Kilka niezbędnych elementów? Pomyśl o ${trends[0].recommendations[0]}, ${trends[1].recommendations[0]}, ${trends[2].recommendations[0]}, i ${trends[3].recommendations[0]}.`,
    zh: `让我们深入了解即将到来的季节最热门的趋势！本季，我们绝对痴迷于${trends[0].trendName}、${trends[1].trendName}、${trends[2].trendName}和${trends[3].trendName}。一些必备单品？想想${trends[0].recommendations[0]}、${trends[1].recommendations[0]}、${trends[2].recommendations[0]}和${trends[3].recommendations[0]}。`,
    ja: `今シーズンの最もホットなトレンドに飛び込みましょう！今シーズン、私たちは${trends[0].trendName}、${trends[1].trendName}、${trends[2].trendName}、${trends[3].trendName}に絶対夢中です。注目すべき必須アイテムは？${trends[0].recommendations[0]}、${trends[1].recommendations[0]}、${trends[2].recommendations[0]}、${trends[3].recommendations[0]}を考えてみてください。`,
    ko: `다가오는 시즌의 가장 핫한 트렌드에 빠져봅시다! 이번 시즌, 우리는 ${trends[0].trendName}, ${trends[1].trendName}, ${trends[2].trendName}, ${trends[3].trendName}에 완전히 빠져있습니다. 집중해야 할 필수 아이템은? ${trends[0].recommendations[0]}, ${trends[1].recommendations[0]}, ${trends[2].recommendations[0]}, ${trends[3].recommendations[0]}를 생각해보세요.`,
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

// Helper function for sustainability page intro
export const speakSustainabilityIntro = (
  voiceId: string,
  languageCode: string,
  volume: number,
  isMuted: boolean
) => {
  const scripts: Record<string, string> = {
    en: `Let's test your sustainability! Do you think you're the most eco-friendly, fashion-forward person out there? Below, we've also got some amazing links to sustainability practices we absolutely adore here at Fashion Forward. Let's make fashion fabulous AND responsible!`,
    es: `¡Probemos tu sostenibilidad! ¿Crees que eres la persona más ecológica y vanguardista en moda? A continuación, también tenemos algunos enlaces increíbles a prácticas de sostenibilidad que adoramos aquí en Fashion Forward.`,
    fr: `Testons votre durabilité! Pensez-vous être la personne la plus écologique et avant-gardiste en matière de mode? Ci-dessous, nous avons également des liens incroyables vers des pratiques de durabilité que nous adorons ici chez Fashion Forward.`,
    de: `Lass uns deine Nachhaltigkeit testen! Denkst du, du bist die umweltfreundlichste, modebewusste Person? Unten haben wir auch einige erstaunliche Links zu Nachhaltigkeitspraktiken, die wir hier bei Fashion Forward absolut lieben.`,
    it: `Testiamo la tua sostenibilità! Pensi di essere la persona più ecologica e all'avanguardia della moda? Qui sotto, abbiamo anche alcuni link fantastici a pratiche di sostenibilità che adoriamo qui a Fashion Forward.`,
    pt: `Vamos testar sua sustentabilidade! Você acha que é a pessoa mais ecológica e na vanguarda da moda? Abaixo, também temos alguns links incríveis para práticas de sustentabilidade que adoramos aqui na Fashion Forward.`,
    pl: `Przetestujmy twoją zrównoważoność! Myślisz, że jesteś najbardziej ekologiczną, modną osobą? Poniżej mamy również niesamowite linki do praktyk zrównoważonego rozwoju, które uwielbiamy tutaj w Fashion Forward.`,
    zh: `让我们测试你的可持续性！你认为你是最环保、最时尚的人吗？下面，我们还提供了一些我们在Fashion Forward非常喜欢的可持续实践的精彩链接。`,
    ja: `あなたの持続可能性をテストしましょう！あなたは最もエコフレンドリーでファッショナブルな人だと思いますか？以下に、Fashion Forwardで大好きな持続可能性の実践へのリンクもあります。`,
    ko: `지속 가능성을 테스트해봅시다! 당신이 가장 친환경적이고 패션에 앞서가는 사람이라고 생각하시나요? 아래에서 Fashion Forward에서 정말 좋아하는 지속 가능성 관행에 대한 놀라운 링크도 확인할 수 있습니다.`,
  };

  return speakText({
    text: scripts[languageCode] || scripts.en,
    voiceId,
    languageCode,
    volume,
    isMuted,
    stability: 0.6,
    similarityBoost: 0.8,
  });
};

export default { 
  speakText, 
  speakUploadMessage, 
  speakTrendResults, 
  speakSeasonalForecast, 
  speakSustainabilityIntro 
};