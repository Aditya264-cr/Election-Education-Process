/**
 * ELECTION MORNING GREETING SYSTEM
 * =================================
 * Date-triggered greeting that activates on April 29, 2026 (WB Phase 2 Polling Day)
 * and May 4, 2026 (Counting Day).
 *
 * Localization: Bengali for West Bengal users, Hindi/English for others.
 */

// ── Election Morning Speeches ──
const ELECTION_SPEECHES = {
  // April 29, 2026 — West Bengal Phase 2 Polling Day
  '2026-04-29': {
    bn: {
      greeting: '🗳️ শুভ নির্বাচন সকাল, প্রতিবেশী!',
      speech: 'আজ আমাদের গণতন্ত্রের সবচেয়ে গুরুত্বপূর্ণ দিনগুলোর একটি। আপনার একটি ভোট লক্ষ লক্ষ স্বপ্নের ভিত্তি। বুথে যান, ভোট দিন, এবং গর্বিত হোন — কারণ আজ আপনি ইতিহাস লিখছেন। মনে রাখবেন, ভোটের গোপনীয়তা আইন দ্বারা সুরক্ষিত। নির্ভয়ে ভোট দিন!',
      closingLine: 'আপনার প্রতিবেশী সবসময় আপনার পাশে আছে। চলুন, একসাথে ভোট দিতে যাই! 🇮🇳',
      boothTip: 'টিপ: সকাল ৭টায় বুথ খুলবে। সকালের দিকে কম ভিড় থাকে!'
    },
    en: {
      greeting: '🗳️ Happy Election Morning, Neighbor!',
      speech: 'Today is one of the most powerful days in our democracy. Your single vote is the foundation of a million dreams. Head to the booth, cast your vote, and be proud — because today, you are writing history. Remember, your vote is secret and protected by law. Vote without fear!',
      closingLine: 'Your Friendly Neighbor is right here with you. Let\'s go vote together! 🇮🇳',
      boothTip: 'Tip: Booths open at 7 AM. Early morning usually has the shortest queues!'
    },
    hi: {
      greeting: '🗳️ चुनाव की शुभ सुबह, पड़ोसी!',
      speech: 'आज हमारे लोकतंत्र का सबसे ताकतवर दिन है। आपका एक वोट लाखों सपनों की नींव है। बूथ पर जाइए, वोट डालिए, और गर्व कीजिए — क्योंकि आज आप इतिहास लिख रहे हैं। याद रखिए, आपका वोट गोपनीय है और कानून द्वारा सुरक्षित है। निडर होकर वोट करें!',
      closingLine: 'आपका फ्रेंडली नेबर हमेशा आपके साथ है। चलिए, साथ मिलकर वोट करने चलते हैं! 🇮🇳',
      boothTip: 'टिप: बूथ सुबह 7 बजे खुलता है। सुबह-सुबह सबसे कम भीड़ रहती है!'
    },
    mr: {
      greeting: '🗳️ निवडणुकीच्या शुभ सकाळ, शेजारी!',
      speech: 'आज आपल्या लोकशाहीतील सर्वात ताकदवान दिवसांपैकी एक आहे. तुमचं एक मत लाखो स्वप्नांचा पाया आहे. बूथवर जा, मतदान करा, आणि अभिमान बाळगा — कारण आज तुम्ही इतिहास लिहित आहात. लक्षात ठेवा, तुमचं मत गोपनीय आहे आणि कायद्याने संरक्षित आहे. निर्भयपणे मतदान करा!',
      closingLine: 'तुमचा फ्रेंडली नेबर नेहमी तुमच्या सोबत आहे. चला, एकत्रित मतदान करायला जाऊया! 🇮🇳',
      boothTip: 'टिप: बूथ सकाळी ७ वाजता उघडतो. सकाळी सर्वात कमी गर्दी असते!'
    },
    ta: {
      greeting: '🗳️ இனிய தேர்தல் காலை, நெய்பர்!',
      speech: 'இன்று நம் ஜனநாயகத்தின் மிக சக்திவாய்ந்த நாட்களில் ஒன்று. உங்கள் ஒரே ஓட்டு கோடிக்கணக்கான கனவுகளின் அடித்தளம். பூத்துக்குச் செல்லுங்கள், ஓட்டு போடுங்கள், பெருமைப்படுங்கள் — ஏனெனில் இன்று நீங்கள் வரலாறு எழுதுகிறீர்கள். நினைவில் கொள்ளுங்கள், உங்கள் ஓட்டு ரகசியமானது, சட்டத்தால் பாதுகாக்கப்படுகிறது. பயமின்றி ஓட்டளியுங்கள்!',
      closingLine: 'உங்கள் ஃப்ரெண்ட்லி நெய்பர் எப்பொழுதும் உங்கள் பக்கம் இருக்கிறார். வாங்க, ஒன்றா ஓட்டு போடலாம்! 🇮🇳',
      boothTip: 'டிப்: பூத் காலை 7 மணிக்கு திறக்கும். அதிகாலையில் கூட்டம் குறைவாக இருக்கும்!'
    }
  },
  // May 4, 2026 — Counting Day
  '2026-05-04': {
    bn: {
      greeting: '🔢 গণনা দিবস এসে গেছে, প্রতিবেশী!',
      speech: 'আজ আপনার ভোটের শক্তি প্রকাশ পাবে। পাঁচটি রাজ্যের ফলাফল আজ ঘোষণা হবে। মনে রাখবেন — যেই জিতুক, গণতন্ত্র জিতেছে কারণ আপনি ভোট দিয়েছেন।',
      closingLine: 'ফলাফলের জন্য আমাদের লাইভ ড্যাশবোর্ড দেখুন! 📊',
      boothTip: ''
    },
    en: {
      greeting: '🔢 Counting Day Is Here, Neighbor!',
      speech: 'Today, your vote speaks. Results for all 5 states will be declared today. Remember — whoever wins, democracy won because you showed up and voted.',
      closingLine: 'Stay tuned to our Live Results Dashboard! 📊',
      boothTip: ''
    },
    hi: {
      greeting: '🔢 गिनती का दिन आ गया, पड़ोसी!',
      speech: 'आज आपका वोट बोलेगा। पाँचों राज्यों के नतीजे आज घोषित होंगे। याद रखिए — जो भी जीते, लोकतंत्र जीता क्योंकि आपने वोट दिया।',
      closingLine: 'हमारा लाइव रिजल्ट डैशबोर्ड देखते रहिए! 📊',
      boothTip: ''
    },
    mr: {
      greeting: '🔢 मतमोजणीचा दिवस आला, शेजारी!',
      speech: 'आज तुमचं मत बोलणार. पाचही राज्यांचे निकाल आज जाहीर होतील. लक्षात ठेवा — कोणीही जिंको, लोकशाही जिंकली कारण तुम्ही मतदान केलं.',
      closingLine: 'आमचा लाइव निकाल डॅशबोर्ड बघत रहा! 📊',
      boothTip: ''
    },
    ta: {
      greeting: '🔢 வாக்கு எண்ணிக்கை நாள் வந்தாச்சு, நெய்பர்!',
      speech: 'இன்று உங்கள் ஓட்டு பேசும். ஐந்து மாநிலங்களின் முடிவுகள் இன்று அறிவிக்கப்படும். நினைவில் கொள்ளுங்கள் — யார் வென்றாலும், ஜனநாயகம் வென்றது ஏனெனில் நீங்கள் ஓட்டுப் போட்டீர்கள்.',
      closingLine: 'எங்கள் லைவ் ரிசல்ட்ஸ் டேஷ்போர்டைப் பாருங்கள்! 📊',
      boothTip: ''
    }
  }
};

/**
 * Get the Election Morning greeting for the current date and language.
 * Returns null if today is not a special election day.
 *
 * @param {string} lang - Current language code (en, hi, mr, ta, bn)
 * @param {string} userState - User's detected state (e.g., "West Bengal")
 * @returns {object|null} - Greeting object or null
 */
export function getElectionGreeting(lang, userState = '') {
  const today = new Date();
  const dateKey = today.toISOString().slice(0, 10); // YYYY-MM-DD

  const speeches = ELECTION_SPEECHES[dateKey];
  if (!speeches) return null;

  // Bengali for West Bengal users, otherwise use their selected language
  let effectiveLang = lang;
  if (userState && userState.toLowerCase().includes('bengal')) {
    effectiveLang = 'bn';
  }

  return speeches[effectiveLang] || speeches.en;
}

/**
 * Check if today is a special election day.
 * @returns {string|null} - 'polling' | 'counting' | null
 */
export function getElectionDayType() {
  const today = new Date().toISOString().slice(0, 10);
  if (today === '2026-04-29') return 'polling';
  if (today === '2026-05-04') return 'counting';
  return null;
}

export default ELECTION_SPEECHES;
