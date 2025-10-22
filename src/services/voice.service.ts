import { ElevenLabsClient } from 'elevenlabs';
import { config } from '../config/env';
import { aiService } from './ai.service';
import logger from '../utils/logger';

// Initialize ElevenLabs client
const elevenlabs = new ElevenLabsClient({
  apiKey: config.elevenlabs.apiKey || 'demo-key', // Will be replaced with real key in production
});

// Voice IDs for different personas
const VOICE_IDS = {
  // Friendly female teacher (Rachel - warm and educational)
  teacher: config.elevenlabs.voiceId || 'EXAVITQu4vr4xnSDxMaL',
  
  // Alternative voices (can be configured via env)
  professional: '21m00Tcm4TlvDq8ikWAM', // Rachel (default ElevenLabs voice)
  energetic: 'ErXwobaYiN019PkySvjV', // Antoni (enthusiastic male)
  calm: 'MF3mGyEYCl7XYWbV9V6O', // Elli (soothing female)
};

// Voice settings for optimal output
const VOICE_SETTINGS = {
  stability: 0.5, // Balance between consistency and expressiveness
  similarity_boost: 0.75, // Voice similarity to original
  style: 0.5, // Speaking style intensity
  use_speaker_boost: true, // Enhance voice clarity
};

class VoiceService {
  /**
   * Convert text to speech using ElevenLabs
   */
  async textToSpeech(
    text: string,
    voiceType: 'teacher' | 'professional' | 'energetic' | 'calm' = 'teacher'
  ): Promise<Buffer> {
    try {
      if (!text || text.trim().length === 0) {
        throw new Error('Text is required for speech synthesis');
      }

      // Limit text length to avoid excessive API costs
      if (text.length > 5000) {
        throw new Error('Text is too long. Maximum 5000 characters allowed.');
      }

      const voiceId = VOICE_IDS[voiceType];

      logger.info(`Generating speech for ${text.length} characters using ${voiceType} voice`);

      // Generate audio using ElevenLabs
      const audio = await elevenlabs.generate({
        voice: voiceId,
        text: text,
        model_id: 'eleven_turbo_v2_5', // Fast, high-quality model
        voice_settings: {
          stability: VOICE_SETTINGS.stability,
          similarity_boost: VOICE_SETTINGS.similarity_boost,
          style: VOICE_SETTINGS.style,
          use_speaker_boost: VOICE_SETTINGS.use_speaker_boost,
        },
      });

      // Convert async iterator to buffer
      const chunks: Buffer[] = [];
      for await (const chunk of audio) {
        chunks.push(Buffer.from(chunk));
      }
      
      const audioBuffer = Buffer.concat(chunks);

      logger.info(`Speech generated successfully - Size: ${audioBuffer.length} bytes`);

      return audioBuffer;
    } catch (error: any) {
      logger.error('Text-to-speech error:', error);
      
      if (error.message?.includes('quota')) {
        throw new Error('Voice AI is temporarily unavailable due to quota limits. Please try again later.');
      }
      
      if (error.message?.includes('rate limit')) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }

      throw new Error('Failed to generate speech. Please try again.');
    }
  }

  /**
   * Ask a question and get both text and voice response
   */
  async askQuestionWithVoice(
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
    voiceType: 'teacher' | 'professional' | 'energetic' | 'calm' = 'teacher'
  ): Promise<{
    question: string;
    answer: string;
    audioBuffer: Buffer;
    audioFormat: string;
    tokensUsed: number;
    characterCount: number;
  }> {
    try {
      // Get AI text response first
      const { answer, tokensUsed } = await aiService.askTutor(question, context);

      // Generate voice for the answer
      const audioBuffer = await this.textToSpeech(answer, voiceType);

      logger.info(`Voice response generated for question: "${question.substring(0, 50)}..."`);

      return {
        question,
        answer,
        audioBuffer,
        audioFormat: 'audio/mpeg', // ElevenLabs returns MP3
        tokensUsed,
        characterCount: answer.length,
      };
    } catch (error) {
      logger.error('Ask question with voice error:', error);
      throw error;
    }
  }

  /**
   * Generate voice explanation for a financial concept
   */
  async explainConceptWithVoice(
    concept: string,
    voiceType: 'teacher' | 'professional' | 'energetic' | 'calm' = 'teacher'
  ): Promise<{
    concept: string;
    explanation: string;
    audioBuffer: Buffer;
    audioFormat: string;
  }> {
    try {
      // Get AI explanation
      const explanation = await aiService.explainConcept(concept);

      // Generate voice
      const audioBuffer = await this.textToSpeech(explanation, voiceType);

      logger.info(`Voice explanation generated for concept: ${concept}`);

      return {
        concept,
        explanation,
        audioBuffer,
        audioFormat: 'audio/mpeg',
      };
    } catch (error) {
      logger.error('Concept explanation with voice error:', error);
      throw error;
    }
  }

  /**
   * Generate voice narration for portfolio insights
   */
  async narratePortfolioInsights(
    insights: string[],
    summary: string,
    voiceType: 'teacher' | 'professional' | 'energetic' | 'calm' = 'teacher'
  ): Promise<{
    script: string;
    audioBuffer: Buffer;
    audioFormat: string;
  }> {
    try {
      // Create a natural narration script
      const script = `Here's what I see in your portfolio:\n\n${insights.join('\n\n')}\n\nIn summary, ${summary}`;

      // Generate voice
      const audioBuffer = await this.textToSpeech(script, voiceType);

      logger.info('Portfolio insights narration generated');

      return {
        script,
        audioBuffer,
        audioFormat: 'audio/mpeg',
      };
    } catch (error) {
      logger.error('Portfolio insights narration error:', error);
      throw error;
    }
  }

  /**
   * Get available voices
   */
  async getAvailableVoices(): Promise<Array<{ id: string; name: string; description: string }>> {
    try {
      // Return preconfigured voices
      return [
        { id: VOICE_IDS.teacher, name: 'Rachel (Teacher)', description: 'Warm and educational female voice - Perfect for learning' },
        { id: VOICE_IDS.professional, name: 'Rachel (Professional)', description: 'Clear professional female voice - Ideal for explanations' },
        { id: VOICE_IDS.energetic, name: 'Antoni (Energetic)', description: 'Enthusiastic male voice - Motivating and engaging' },
        { id: VOICE_IDS.calm, name: 'Elli (Calm)', description: 'Soothing female voice - Relaxing and easy to follow' },
      ];
    } catch (error) {
      logger.error('Get voices error:', error);
      throw error;
    }
  }

  /**
   * Get user's usage stats for voice
   */
  async getUserUsageStats(userId: string): Promise<{
    charactersUsedThisMonth: number;
    questionsAskedThisMonth: number;
    remainingCharacters: number;
  }> {
    // This will be implemented with usage tracking
    // For now, return mock data
    return {
      charactersUsedThisMonth: 0,
      questionsAskedThisMonth: 0,
      remainingCharacters: 10000, // Example limit
    };
  }

  /**
   * Health check for voice service
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Try generating a very short audio clip
      const testAudio = await this.textToSpeech('Hello', 'teacher');
      return testAudio.length > 0;
    } catch (error) {
      logger.error('Voice service health check failed:', error);
      return false;
    }
  }

  /**
   * Convert audio buffer to base64 (for frontend consumption)
   */
  bufferToBase64(buffer: Buffer): string {
    return buffer.toString('base64');
  }

  /**
   * Get audio duration estimate (approximate)
   */
  estimateAudioDuration(characterCount: number): number {
    // Average speaking rate: ~150 words per minute
    // Average word length: ~5 characters
    // So roughly 750 characters per minute, or 12.5 characters per second
    const durationSeconds = characterCount / 12.5;
    return Math.ceil(durationSeconds);
  }
}

export const voiceService = new VoiceService();

