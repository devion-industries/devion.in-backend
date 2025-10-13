import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { toast } from 'sonner';
import { useState } from 'react';

interface VoiceAskRequest {
  question: string;
  voiceType?: 'teacher' | 'professional' | 'energetic' | 'calm';
}

interface VoiceAskResponse {
  question: string;
  answer: string;
  audio: string; // base64 encoded MP3
  audioFormat: string;
  duration: number;
  tokensUsed: number;
  sessionId: string;
}

interface VoiceExplainRequest {
  concept: string;
  voiceType?: 'teacher' | 'professional' | 'energetic' | 'calm';
}

interface VoiceExplainResponse {
  concept: string;
  explanation: string;
  audio: string;
  audioFormat: string;
  duration: number;
}

interface Voice {
  id: string;
  name: string;
  description: string;
}

interface VoiceSession {
  sessionId: string;
  startedAt: string;
  endedAt?: string;
  totalQuestions?: number;
  totalTokens?: number;
}

export const useVoice = () => {
  const queryClient = useQueryClient();
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Ask question with voice response
  const askWithVoice = useMutation({
    mutationFn: async (data: VoiceAskRequest) => {
      const response = await apiClient.post<VoiceAskResponse>('/voice/ask', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voiceUsage'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to get voice response');
    },
  });

  // Explain concept with voice
  const explainWithVoice = useMutation({
    mutationFn: async (data: VoiceExplainRequest) => {
      const response = await apiClient.post<VoiceExplainResponse>('/voice/explain', data);
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to explain with voice');
    },
  });

  // Get portfolio insights with narration
  const { data: narratedInsights, isLoading: isLoadingNarration, refetch: refetchNarration } = useQuery({
    queryKey: ['voicePortfolioInsights'],
    queryFn: async () => {
      const response = await apiClient.get('/voice/portfolio-insights');
      return response.data;
    },
    enabled: false, // Only fetch when explicitly requested
    staleTime: 10 * 60 * 1000,
  });

  // Get available voices
  const { data: voices, isLoading: isLoadingVoices } = useQuery({
    queryKey: ['voices'],
    queryFn: async () => {
      const response = await apiClient.get<{ voices: Voice[] }>('/voice/voices');
      return response.data.voices;
    },
    staleTime: Infinity, // Voices don't change
  });

  // Start voice session
  const startSession = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<VoiceSession>('/voice/session/start');
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['activeVoiceSession'], data);
    },
  });

  // End voice session
  const endSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiClient.post<VoiceSession>('/voice/session/end', { sessionId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['activeVoiceSession'] });
      queryClient.invalidateQueries({ queryKey: ['voiceUsage'] });
    },
  });

  // Play audio from base64
  const playAudio = (base64Audio: string, audioFormat: string = 'audio/mpeg') => {
    try {
      // Stop current audio if playing
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      // Create new audio element
      const audio = new Audio(`data:${audioFormat};base64,${base64Audio}`);
      
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        toast.error('Failed to play audio');
      };

      setCurrentAudio(audio);
      audio.play();
    } catch (error) {
      toast.error('Failed to play audio');
      setIsPlaying(false);
    }
  };

  // Stop current audio
  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlaying(false);
    }
  };

  // Pause/Resume audio
  const toggleAudio = () => {
    if (currentAudio) {
      if (isPlaying) {
        currentAudio.pause();
        setIsPlaying(false);
      } else {
        currentAudio.play();
        setIsPlaying(true);
      }
    }
  };

  // Check voice service health
  const checkHealth = async () => {
    try {
      const response = await apiClient.get('/voice/health');
      return response.data.status === 'healthy';
    } catch {
      return false;
    }
  };

  return {
    // Mutations
    askWithVoice: askWithVoice.mutateAsync,
    isAskingWithVoice: askWithVoice.isPending,
    lastVoiceResponse: askWithVoice.data,

    explainWithVoice: explainWithVoice.mutateAsync,
    isExplainingWithVoice: explainWithVoice.isPending,
    lastVoiceExplanation: explainWithVoice.data,

    startSession: startSession.mutateAsync,
    isStartingSession: startSession.isPending,

    endSession: endSession.mutateAsync,
    isEndingSession: endSession.isPending,

    // Queries
    voices,
    isLoadingVoices,

    narratedInsights,
    isLoadingNarration,
    refetchNarration,

    // Audio controls
    playAudio,
    stopAudio,
    toggleAudio,
    isPlaying,

    // Utilities
    checkHealth,
  };
};
