import OpenAI from 'openai';
import { createHash } from 'crypto';
import { config } from '../config/env';
import logger from '../utils/logger';
import { redisService } from './redis.service';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

// AI Tutor persona and system prompt
const TUTOR_SYSTEM_PROMPT = `You are Devion's AI Financial Tutor, a friendly and knowledgeable guide helping Indian teenagers (13-18 years) learn about investing and finance.

**Your Personality:**
- Warm, encouraging, and patient like a favorite teacher
- Uses simple language and relatable examples from Indian context
- Breaks down complex financial concepts into digestible, detailed pieces
- Celebrates learning progress and encourages questions
- Uses occasional emojis to keep things engaging (but not excessive)

**Your Expertise:**
- Stock market fundamentals (NSE, BSE, indices like NIFTY 50)
- Portfolio management and diversification
- Risk management and investment strategies
- Financial literacy basics (saving, budgeting, compounding)
- Indian stocks and companies (Reliance, TCS, HDFC Bank, etc.)
- Market terminology in simple terms

**CRITICAL: Response Structure (ALWAYS follow this format):**

When explaining financial concepts, ALWAYS structure your response as:

1. **📖 Definition (2-3 sentences)**
   - Start with a clear, simple definition
   - Use proper financial terminology
   - Explain what it is in plain language

2. **🎯 Analogy (2-3 sentences)**
   - Provide a relatable real-world analogy
   - Use Indian context (chai, cricket, Bollywood, everyday life)
   - Make it memorable and fun

3. **💡 Practical Example (3-4 sentences)**
   - Give a concrete example with numbers
   - Use Indian Rupees (₹) and Indian companies/markets
   - Show how it works in real life
   - Connect to their ₹10,000 portfolio if relevant

4. **✨ Key Takeaway (1-2 sentences)**
   - Summarize the most important point
   - Give actionable advice or next step
   - End with an engaging question to encourage thinking

**Formatting Rules:**
- Use **bold** for section headers (with emojis): **📖 Definition**, **🎯 Analogy**, **💡 Example**, **✨ Key Takeaway**
- Start example paragraphs with "Example:" to trigger special formatting
- Start key points with "Key takeaway:" to trigger special formatting
- Keep paragraphs short (2-4 lines max) for better readability
- Add blank lines between major sections
- For lists, use simple bullet points (the UI will style them automatically)
- End with an engaging question to encourage thinking

**Example Response Format:**

Question: "What are bonds?"

**📖 Definition**

Bonds are debt instruments issued by governments or corporations to raise money. When you buy a bond, you're essentially lending money to the issuer. In return, they promise to pay you back the principal amount on a specific date (maturity date) plus regular interest payments (called coupon payments).

**🎯 Simple Analogy**

Think of bonds like lending ₹1,000 to your friend for their lemonade stand. They promise to pay you back in 1 year, plus give you ₹50 every 6 months as a "thank you" for the loan. That ₹50 is like the interest, and the ₹1,000 you get back is the principal. In investing, when you buy a bond, you're the friend lending money!

**💡 Real Example**

Example: Let's say the Indian government issues a bond worth ₹10,000 with a 7% annual interest rate for 5 years. If you buy this bond, you invest ₹10,000 today, receive ₹700 per year as interest, and after 5 years, get your ₹10,000 back. Your total earnings would be ₹3,500 in interest plus the principal amount.

Bonds are safer than stocks because you know exactly what you'll get. However, they usually give lower returns compared to stocks over the long term.

**✨ Key Takeaway**

Key takeaway: Bonds are perfect for the safer portion of your portfolio. They won't make you rich quickly, but they provide steady, predictable income. For your ₹10,000 portfolio, putting 20-30% in bonds could help balance risk!

What do you think - would you prefer the stability of bonds or the growth potential of stocks? 🤔

**Important Guidelines:**
- ALWAYS follow the Definition → Analogy → Example → Takeaway structure
- Be detailed and thorough - students should feel they truly understand
- Use Indian context for all examples (₹, NSE/BSE, Indian companies)
- Never give direct investment advice or stock recommendations
- Encourage students to do their own research (DYOR)
- Ask thought-provoking questions at the end
- Reference their portfolio context when provided

**When discussing portfolios:**
- Analyze their holdings objectively
- Point out good diversification practices
- Highlight areas for improvement
- Explain P&L in simple terms with examples
- Connect performance to market events

Remember: Your goal is to build confident, informed investors who understand WHY they make decisions, not just WHAT to buy. Make every response educational, engaging, and memorable!`;

/**
 * Generate cache key for a question
 */
function generateCacheKey(question: string, userId?: string): string {
  const normalizedQuestion = question.trim().toLowerCase();
  const hash = createHash('md5').update(normalizedQuestion).digest('hex');
  return `ai:cache:${hash}`;
}

class AIService {
  /**
   * Ask the AI tutor a question with optional context about user's portfolio and current lesson
   */
  async askTutor(
    question: string,
    context?: {
      userId?: string;
      budget?: number;
      portfolioValue?: number;
      cashAvailable?: number;
      totalInvested?: number;
      holdings?: Array<{ 
        symbol: string; 
        companyName: string;
        sector: string;
        quantity: number; 
        avgCost: number;
        currentPrice: number;
        invested: number;
        currentValue: number;
        gainLoss: number;
        gainLossPercent: number;
      }>;
      recentTrades?: Array<{ symbol: string; type: string; quantity: number; price: number; when: string }>;
    },
    lessonContext?: {
      lessonId?: string;
      lessonTitle?: string;
      lessonNumber?: number;
      moduleTitle?: string;
      currentCardIndex?: number;
      totalCards?: number;
      cardContent?: string;
    }
  ): Promise<{ answer: string; tokensUsed: number; cached?: boolean }> {
    try {
      // Only cache generic questions (without portfolio context)
      const shouldCache = !context || (!context.portfolioValue && !context.holdings && !context.recentTrades);
      
      // Check cache first for generic questions
      if (shouldCache && redisService.isReady()) {
        const cacheKey = generateCacheKey(question, context?.userId);
        const cachedResponse = await redisService.get(cacheKey);
        
        if (cachedResponse) {
          const parsed = JSON.parse(cachedResponse);
          logger.info(`AI cache HIT for question: "${question.substring(0, 50)}..."`);
          return { ...parsed, cached: true };
        }
        logger.info(`AI cache MISS for question: "${question.substring(0, 50)}..."`);
      }

      // Build rich context-aware prompt
      let userContext = '';
      if (context && context.portfolioValue) {
        userContext = `\n\n===== STUDENT'S PORTFOLIO DATA =====\n`;
        
        // Portfolio summary
        userContext += `\n📊 Portfolio Summary:\n`;
        userContext += `- Starting Budget: ₹${(context.budget || 10000).toLocaleString('en-IN')}\n`;
        userContext += `- Total Portfolio Value: ₹${context.portfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
        userContext += `- Cash Available: ₹${(context.cashAvailable || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
        userContext += `- Total Invested: ₹${(context.totalInvested || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
        
        const totalPnL = context.portfolioValue - (context.budget || 10000);
        const totalPnLPercent = ((totalPnL / (context.budget || 10000)) * 100);
        userContext += `- Overall P&L: ₹${totalPnL.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${totalPnLPercent >= 0 ? '+' : ''}${totalPnLPercent.toFixed(2)}%)\n`;

        // Holdings details
        if (context.holdings && context.holdings.length > 0) {
          userContext += `\n📈 Current Holdings (${context.holdings.length}):\n`;
          context.holdings.forEach((h, idx) => {
            userContext += `${idx + 1}. ${h.companyName} (${h.symbol}) - ${h.sector}\n`;
            userContext += `   • Quantity: ${h.quantity} shares\n`;
            userContext += `   • Avg Cost: ₹${h.avgCost.toFixed(2)}/share | Current: ₹${h.currentPrice.toFixed(2)}/share\n`;
            userContext += `   • Invested: ₹${h.invested.toFixed(2)} → Current Value: ₹${h.currentValue.toFixed(2)}\n`;
            userContext += `   • P&L: ₹${h.gainLoss.toFixed(2)} (${h.gainLossPercent >= 0 ? '+' : ''}${h.gainLossPercent.toFixed(2)}%)\n`;
          });

          // Sector diversification
          const sectorMap = new Map<string, number>();
          context.holdings.forEach(h => {
            const current = sectorMap.get(h.sector) || 0;
            sectorMap.set(h.sector, current + h.currentValue);
          });
          
          userContext += `\n🎯 Sector Allocation:\n`;
          Array.from(sectorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .forEach(([sector, value]) => {
              const percent = (value / context.totalInvested!) * 100;
              userContext += `   • ${sector}: ₹${value.toFixed(2)} (${percent.toFixed(1)}%)\n`;
            });
        } else {
          userContext += `\n📈 Current Holdings: None yet (full budget available for trading)\n`;
        }

        // Recent trading activity
        if (context.recentTrades && context.recentTrades.length > 0) {
          userContext += `\n📝 Recent Trades (Last ${Math.min(context.recentTrades.length, 5)}):\n`;
          context.recentTrades.forEach((t, idx) => {
            const timeAgo = new Date(t.when);
            const hoursAgo = Math.floor((Date.now() - timeAgo.getTime()) / (1000 * 60 * 60));
            const timeStr = hoursAgo < 1 ? 'Just now' : hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`;
            userContext += `${idx + 1}. ${t.type} ${t.quantity} × ${t.symbol} @ ₹${t.price.toFixed(2)} (${timeStr})\n`;
          });
        } else {
          userContext += `\n📝 Recent Trades: No trades yet\n`;
        }

        userContext += `\n===================================\n`;
        userContext += `\nUse this portfolio data to give personalized, contextual advice. Reference their actual holdings, sectors, P&L, and trading activity when relevant.`;
      }

      // Add lesson context if available
      let lessonContextStr = '';
      if (lessonContext && lessonContext.lessonTitle) {
        lessonContextStr = `\n\n===== LESSON CONTEXT =====\n`;
        lessonContextStr += `\nThe student is currently learning:\n`;
        lessonContextStr += `📚 Module: ${lessonContext.moduleTitle || 'N/A'}\n`;
        lessonContextStr += `📖 Lesson ${lessonContext.lessonNumber}: ${lessonContext.lessonTitle}\n`;
        
        if (lessonContext.currentCardIndex !== undefined && lessonContext.currentCardIndex >= 0) {
          lessonContextStr += `📄 Card: ${lessonContext.currentCardIndex + 1} of ${lessonContext.totalCards}\n`;
          if (lessonContext.cardContent) {
            lessonContextStr += `\nCurrent card preview: "${lessonContext.cardContent}..."\n`;
          }
        } else if (lessonContext.currentCardIndex === -1) {
          lessonContextStr += `📝 Currently taking the quiz for this lesson\n`;
        }
        
        lessonContextStr += `\n==========================\n`;
        lessonContextStr += `\nIMPORTANT: The student's question is related to this lesson. Give answers that:
1. Connect to the specific lesson topic they're learning
2. Reference concepts from this lesson when relevant
3. Help clarify confusing parts of the lesson
4. Encourage them to apply what they're learning
5. Keep explanations aligned with their current learning level in this module\n`;
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview', // Using GPT-4 Turbo for better performance
        messages: [
          {
            role: 'system',
            content: TUTOR_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: `${question}${lessonContextStr}${userContext}`,
          },
        ],
        temperature: 0.7, // Balanced creativity and consistency
        max_tokens: 800, // Allow detailed, well-structured responses
        top_p: 0.9,
        frequency_penalty: 0.3, // Reduce repetition
        presence_penalty: 0.3, // Encourage diverse responses
      });

      const answer = response.choices[0].message.content || 'I apologize, but I encountered an issue generating a response. Please try asking your question again.';
      const tokensUsed = response.usage?.total_tokens || 0;

      const result = {
        answer: answer.trim(),
        tokensUsed,
      };

      // Cache the response for generic questions (24 hours)
      if (shouldCache && redisService.isReady()) {
        const cacheKey = generateCacheKey(question, context?.userId);
        await redisService.set(cacheKey, JSON.stringify(result), 86400); // 24 hours
        logger.info(`AI response CACHED for question: "${question.substring(0, 50)}..."`);
      }

      logger.info(`AI Tutor response generated - Tokens: ${tokensUsed}, Question: "${question.substring(0, 50)}..."`);

      return result;
    } catch (error: any) {
      logger.error('AI Tutor error:', error);
      
      // Handle specific OpenAI errors
      if (error.code === 'insufficient_quota') {
        throw new Error('AI Tutor is temporarily unavailable due to quota limits. Please try again later.');
      }
      
      if (error.code === 'rate_limit_exceeded') {
        throw new Error('Too many questions asked. Please wait a moment and try again.');
      }

      throw new Error('AI Tutor encountered an error. Please try again.');
    }
  }

  /**
   * Generate portfolio insights based on user's holdings and performance
   */
  async generatePortfolioInsights(
    portfolioData: {
      totalValue: number;
      gainLoss: number;
      gainLossPercent: number;
      holdings: Array<{
        symbol: string;
        name: string;
        quantity: number;
        avgCost: number;
        currentPrice: number;
        gainLoss: number;
        gainLossPercent: number;
        sector?: string;
      }>;
    }
  ): Promise<{ insights: string[]; summary: string }> {
    try {
      const prompt = `You are a friendly trading tutor talking to a high school student about their portfolio. Use SIMPLE, easy-to-understand language.

Student's Portfolio:
- Total Value: ₹${portfolioData.totalValue.toLocaleString('en-IN')}
- Profit/Loss: ${portfolioData.gainLoss >= 0 ? '+' : ''}₹${portfolioData.gainLoss.toFixed(2)} (${portfolioData.gainLossPercent.toFixed(2)}%)
- Stocks Owned: ${portfolioData.holdings.length}

Their Stocks:
${portfolioData.holdings.map(h => `- ${h.symbol} (${h.name}): ${h.quantity} shares, ${h.gainLossPercent >= 0 ? 'Up' : 'Down'} ${Math.abs(h.gainLossPercent).toFixed(1)}%${h.sector ? `, ${h.sector} sector` : ''}`).join('\n')}

Give 3 SHORT, SIMPLE tips (one sentence each) using friendly language a teenager understands:
1. Say something encouraging about their stocks or sectors
2. Point out their best OR worst performing stock
3. Give ONE easy action they can take next

Keep it friendly, simple, and motivating. No complex financial jargon. Write like you're texting a friend.

After the 3 tips, add a SHORT summary sentence (under 15 words).`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: TUTOR_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 600,
      });

      const content = response.choices[0].message.content || '';
      
      // Parse insights (split by numbered list)
      const lines = content.split('\n').filter(line => line.trim());
      const insights = lines.filter(line => /^\d+\./.test(line.trim())).map(line => line.replace(/^\d+\.\s*/, '').trim());
      const summary = lines.find(line => !line.startsWith('1.') && !line.startsWith('2.') && !line.startsWith('3.') && !line.startsWith('4.') && line.length > 20) || insights[0] || 'Your portfolio shows potential for growth with strategic adjustments.';

      logger.info(`Portfolio insights generated for ${portfolioData.holdings.length} holdings`);

      return {
        insights: insights.slice(0, 4), // Maximum 4 insights
        summary,
      };
    } catch (error) {
      logger.error('Portfolio insights error:', error);
      
      // Fallback insights
      return {
        insights: [
          'Nice start! Having stocks from different sectors helps spread out your risk.',
          'Keep an eye on your best-performing stock - it\'s doing well!',
          'Try checking your portfolio regularly to see how your stocks are doing.',
        ],
        summary: 'Your portfolio is off to a good start!',
      };
    }
  }

  /**
   * Explain a stock market concept in simple terms
   */
  async explainConcept(concept: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: TUTOR_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Explain the concept of "${concept}" following the structure: Definition → Analogy → Example → Takeaway. Make it detailed and educational for a teenager learning about investing.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      return response.choices[0].message.content?.trim() || 'I apologize, but I encountered an issue explaining this concept.';
    } catch (error) {
      logger.error('Concept explanation error:', error);
      throw new Error('Unable to explain concept at this time.');
    }
  }

  /**
   * Suggest learning topics based on user's current knowledge level
   */
  async suggestLearningPath(
    completedLessons: string[],
    quizScores: Array<{ topic: string; score: number }>
  ): Promise<{ nextTopics: string[]; reasoning: string }> {
    try {
      const prompt = `A student has completed these lessons: ${completedLessons.join(', ') || 'None yet'}
      
Recent quiz scores: ${quizScores.map(q => `${q.topic}: ${q.score}%`).join(', ') || 'None yet'}

Based on their progress, suggest 3-5 topics they should learn next. Topics should build on what they know and address any weak areas. 

Available topics include: Stock Market Basics, Portfolio Diversification, Risk Management, Technical Analysis, Fundamental Analysis, Market Indices, Sector Analysis, Trading Strategies, Financial Statements, Value Investing.

Format: List the topics and provide a brief reason for the learning path.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: TUTOR_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.6,
        max_tokens: 400,
      });

      const content = response.choices[0].message.content || '';
      const lines = content.split('\n').filter(l => l.trim());
      
      // Extract topics (usually numbered or bulleted)
      const nextTopics = lines
        .filter(l => /^[\d-•]/.test(l.trim()))
        .map(l => l.replace(/^[\d-•.\s]+/, '').split(':')[0].trim())
        .slice(0, 5);

      const reasoning = lines.find(l => l.length > 50 && !/^[\d-•]/.test(l)) || 'These topics will strengthen your foundation and expand your knowledge.';

      return { nextTopics, reasoning };
    } catch (error) {
      logger.error('Learning path suggestion error:', error);
      
      // Fallback suggestions
      return {
        nextTopics: ['Stock Market Basics', 'Portfolio Diversification', 'Risk Management'],
        reasoning: 'Start with fundamentals and build a strong foundation for your investing journey.',
      };
    }
  }

  /**
   * Health check for AI service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10,
      });
      return !!response.choices[0].message.content;
    } catch (error) {
      logger.error('AI health check failed:', error);
      return false;
    }
  }
}

export const aiService = new AIService();

