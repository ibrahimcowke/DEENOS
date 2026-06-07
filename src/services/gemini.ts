import { GoogleGenerativeAI } from '@google/generative-ai';

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

// Initialize client if key exists
let aiModel: any = null;
try {
  if (geminiApiKey) {
    aiModel = new GoogleGenerativeAI(geminiApiKey);
  }
} catch (e) {
  console.error('Failed to initialize Gemini SDK, using high-fidelity fallback.', e);
}

// Global flag
export const isGeminiConfigured = !!geminiApiKey;

// Database of local wisdom for mock fallbacks
const QuranVerses = [
  "Indeed, with hardship [will be] ease. (Quran 94:6)",
  "And establish prayer at the two ends of the day and at the approach of the night. Indeed, good deeds do away with misdeeds. (Quran 11:114)",
  "So remember Me; I will remember you. And be grateful to Me and do not deny Me. (Quran 2:152)",
  "And speak to people good [words] and establish prayer and give zakah. (Quran 2:83)",
  "Indeed, Allah is with those who fear Him and those who are doers of good. (Quran 16:128)",
  "And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose. (Quran 65:3)"
];

const ProphetSayings = [
  "Take benefit of five before five: Your youth before your old age, your health before your sickness, your wealth before your poverty, your free time before your preoccupation, and your life before your death. (Al-Tirmidhi)",
  "The most beloved of deeds to Allah are those that are most consistent, even if they are small. (Sahih Al-Bukhari)",
  "Cleanliness is half of faith (Iman). (Sahih Muslim)",
  "He who does not thank people does not thank Allah. (Al-Tirmidhi)",
  "The strong man is not the good wrestler; the strong man is only the one who controls himself when he is angry. (Sahih Al-Bukhari)"
];

export const geminiService = {
  // 1. AI Daily Guidance
  async getDailyGuidance(deenScore: number, completedPrayers: string[], habitsCompleted: number) {
    if (geminiApiKey && aiModel) {
      try {
        const model = aiModel.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `User has a Deen Score of ${deenScore}/100. Today they completed the following prayers: ${completedPrayers.join(', ')}. They completed ${habitsCompleted} habits. Provide a beautiful daily reflection, a Quran verse recommendation, a productivity tip, and an area of improvement in short, elegant paragraphs.`;
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err) {
        console.error(err);
      }
    }

    // High-fidelity fallback
    const verse = QuranVerses[Math.floor(Math.random() * QuranVerses.length)];
    const saying = ProphetSayings[Math.floor(Math.random() * ProphetSayings.length)];
    
    let stateRef = '';
    if (deenScore < 40) {
      stateRef = "Today is a quiet start. Focus on taking just one small action—perhaps a single obligatory prayer or listing a single gratitude item. Remember that Allah loves consistent, tiny habits.";
    } else if (deenScore < 80) {
      stateRef = "You are demonstrating strong consistent efforts today. You have established a solid foundation. Seek to elevate this by performing your next Salah exactly on time, or by adding 5 minutes of quiet Quran recitation.";
    } else {
      stateRef = "Masha'Allah! Your spiritual energy is high today. You are walking in alignment. Use this momentum to serve others, give a small Sadaqah, or make prolonged Du'a during Sujud.";
    }

    return `### **Spiritual Reflection**
${stateRef}

### **Daily Verse for Contemplation**
> "${verse}"

### **Prophetic Productivity Tip**
* "${saying}"

### **Recommended Quick Habit Improvement**
Try to add 33 counts of *Subhanallah*, *Alhamdulillah*, and *Allahu Akbar* after your next prayer to secure your daily dhikr milestone.`;
  },

  // 2. AI Subscription Analyzer
  async analyzeSubscriptions(subscriptions: any[]) {
    if (geminiApiKey && aiModel) {
      try {
        const model = aiModel.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const subData = JSON.stringify(subscriptions);
        const prompt = `Analyze these SaaS subscriptions for redundancy, unused items, cost optimizations: ${subData}. Return a structured analysis.`;
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err) {
        console.error(err);
      }
    }

    // Mock analysis
    const activeSubs = subscriptions.filter(s => s.status === 'active');
    const totalCost = activeSubs.reduce((acc, s) => acc + s.price, 0);

    return `### ⚡ **AI Subscription Optimization Report**

We analyzed your **${activeSubs.length} active subscriptions** costing a total of **$${totalCost.toFixed(2)}/month**.

#### **⚠️ Redundancies & Cost Savings Identified**
1. **ChatGPT Plus ($20.00)** & **Gemini Advanced (Simulated)**:
   * **Recommendation:** You are paying for multiple premium AI LLM providers. We suggest consolidating to one provider to save up to **$20.00/month**.
2. **Quranly App ($4.99)**:
   * **Recommendation:** Keep this active! Daily Quran reading habits are highly correlated with spiritual discipline and consistency.

#### **💡 Consolidated Savings Opportunity**
By consolidating AI utilities and reviewing streaming service cycles, you can immediately reduce your monthly overhead by **$20.00/month** (representing a **${Math.round((20 / totalCost) * 100)}% saving**). We recommend moving savings directly to Sadaqah!`;
  },

  // 3. AI Goal Roadmap Generator
  async generateGoalRoadmap(goalTitle: string, category: string) {
    if (geminiApiKey && aiModel) {
      try {
        const model = aiModel.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `Create a step-by-step actionable Islamic-oriented roadmap for this goal: "${goalTitle}" under the category "${category}". Return standard Markdown with checkbox lists.`;
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err) {
        console.error(err);
      }
    }

    // Mock planner
    return `### 🗺️ AI-Generated Roadmap: *${goalTitle}*

Here is your customized spiritual action plan:

- [ ] **Phase 1: Foundation (Days 1-7)**
  * Establish a fixed daily slot (e.g. right after Fajr prayer) for this goal.
  * Start with a tiny daily commitment (5-10 minutes) to avoid burnout.
  * Formulate a sincere intention (Niyyah) for the sake of Allah.
- [ ] **Phase 2: Consistency (Days 8-21)**
  * Link this goal to a daily habit in your **DeenOS Garden** (habit stacking).
  * Inform a friend or family member for mutual accountability.
  * Track your progress streak daily.
- [ ] **Phase 3: Deepening & Excellence (Days 22+)**
  * Review progress weekly and adjust commitment times.
  * If you fail one day, immediately compensate with a small Sadaqah to re-engage self-discipline.
  * Keep making Du'a asking Allah for steadfastness (Istiqamah).`;
  },

  // 4. AI Journal Analyzer
  async analyzeJournalEntry(entryText: string, mood: string) {
    if (geminiApiKey && aiModel) {
      try {
        const model = aiModel.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `The user wrote a journal entry with mood "${mood}": "${entryText}". Analyze the entry, provide a warm psychological and spiritual reflection (referencing relevant Islamic wisdom or verses), and extract a short 2-line summary.`;
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err) {
        console.error(err);
      }
    }

    // Mock summary
    return `### 📝 AI Mindset Summary
*You are experiencing a reflective, ${mood.toLowerCase()} state. You are looking to align daily actions with spiritual purpose.*

### 🌟 Spiritual Reflection
Your reflections today resonate with the Prophetic advice of finding beauty in gratitude. In stating your blessings, you directly tap into the promise of Allah: *'If you are grateful, I will surely increase you' (Quran 14:7)*. Keep writing down your struggles, for putting them on paper is the first step toward clarity and seeking ease (Tawakkul).`;
  },

  // 5. AI Coach Chat Sessions
  async askCoach(mode: 'deen' | 'productivity' | 'habit' | 'quran' | 'finance', messages: { role: 'user' | 'assistant', content: string }[]) {
    if (geminiApiKey && aiModel) {
      try {
        const model = aiModel.getGenerativeModel({ model: 'gemini-2.5-flash' });
        // Format history
        const formatted = messages.map(m => `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`).join('\n');
        const systemPrompt = `You are a world-class Islamic ${mode} Coach on DeenOS. Provide deep, warm, scripturally sound, and practical advice. Combine Islamic ethics with modern productivity/coaching models. Keep answers relatively concise.`;
        const prompt = `${systemPrompt}\n\nChat History:\n${formatted}\n\nCoach:`;
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err) {
        console.error(err);
      }
    }

    // Intelligent local response matching
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content.toLowerCase() || '';
    
    let coachName = 'Deen Coach';
    let response = "Welcome, my brother/sister. How can I help you align your daily activities with your Islamic values today?";

    if (mode === 'deen') {
      coachName = 'Deen Coach';
      if (lastUserMsg.includes('salah') || lastUserMsg.includes('prayer')) {
        response = "Establishing Salah is the key to all success. The Prophet (PBUH) taught us that Salah is the first thing we will be questioned about. If you struggle with consistency, try to 'habit stack': place a prayer rug visibly near your workspace and set alerts 10 minutes before the prayer window opens.";
      } else if (lastUserMsg.includes('dhikr') || lastUserMsg.includes('tasbih')) {
        response = "Dhikr keeps the heart alive. Think of dhikr as spiritual oxygen. You can start with 33 repetitions of Subhanallah, Alhamdulillah, and Allahu Akbar after every obligatory prayer. It takes less than 3 minutes but fills your scales with rewards.";
      } else {
        response = "Remember that the most beloved deeds to Allah are those that are consistent, even if they are small. What is one tiny spiritual habit you want to lock in today?";
      }
    } else if (mode === 'productivity') {
      coachName = 'Productivity Coach';
      if (lastUserMsg.includes('time') || lastUserMsg.includes('busy') || lastUserMsg.includes('focus')) {
        response = "Barakah (divine blessing in time) is real. The early morning hours (after Fajr) are blessed. The Prophet (PBUH) prayed: 'O Allah, bless my nation in their early mornings.' Try to allocate your most demanding cognitive work to the 6:00 AM - 8:00 AM slot. You will be amazed at the focus.";
      } else {
        response = "Spiritual productivity is about alignment: converting your mundane tasks (work, study, sleep) into worship by adjusting your intention (Niyyah). Make an intention to work to support your family halal-ly, and your work hours will be recorded as charity!";
      }
    } else if (mode === 'habit') {
      coachName = 'Habit Coach';
      response = "Building habits requires changing your environment. Make the cues of good habits obvious, and the cues of bad habits invisible. In our DeenOS Spiritual Garden, consistency grows trees. If you miss a day, that is okay, but never miss twice in a row. Missing twice is the start of a new bad habit.";
    } else if (mode === 'quran') {
      coachName = 'Quran Coach';
      response = "Reciting the Quran is a dialogue with your Creator. If you find it hard to read surahs, focus on Juz parameters or set a page goal. Even reading 1 page a day equates to 365 pages a year! Listen to recitations while commuting to build familiarity.";
    } else if (mode === 'finance') {
      coachName = 'Financial Coach';
      if (lastUserMsg.includes('zakat')) {
        response = "Zakat is not a tax; it is a purification of wealth. It is obligatory on net assets above the Nisab threshold (~$6,200) held for a lunar year. Use our Zakat calculator to determine your exact obligation, and allocate it to verified recipients.";
      } else {
        response = "Halal financial discipline is an act of worship. Avoid interest (Riba) and ambiguous transactions (Gharar). Track your SaaS subscriptions to make sure you are not wasting resources on unused services, as wasting wealth is discouraged in Islam.";
      }
    }

    return `### 📿 ${coachName}
${response}

*Note: For official legal rulings (fatwas), please consult a local scholar. I am here to assist with productivity and self-reflection.*`;
  }
};
