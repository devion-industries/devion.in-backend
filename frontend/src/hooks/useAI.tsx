import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { toast } from 'sonner';

interface AskQuestionRequest {
  question: string;
}

interface AskQuestionResponse {
  question: string;
  answer: string;
  tokensUsed: number;
}

interface PortfolioInsightsResponse {
  insights: string[];
  summary: string;
  portfolioValue: number;
  holdingsCount: number;
}

interface ExplainConceptRequest {
  concept: string;
}

interface ExplainConceptResponse {
  concept: string;
  explanation: string;
}

interface LearningPathResponse {
  completedLessons: number;
  nextTopics: string[];
  reasoning: string;
}

export const useAI = () => {
  const queryClient = useQueryClient();

  // Ask AI Tutor a question
  const askQuestion = useMutation({
    mutationFn: async (data: AskQuestionRequest) => {
      const response = await apiClient.post<AskQuestionResponse>('/ai/ask', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate usage stats
      queryClient.invalidateQueries({ queryKey: ['aiUsage'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to get AI response');
    },
  });

  // Get portfolio insights (cached)
  const { data: portfolioInsights, isLoading: isLoadingInsights, refetch: refetchInsights } = useQuery({
    queryKey: ['portfolioInsights'],
    queryFn: async () => {
      const response = await apiClient.get<PortfolioInsightsResponse>('/ai/portfolio-insights');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });

  // Explain a concept
  const explainConcept = useMutation({
    mutationFn: async (data: ExplainConceptRequest) => {
      const response = await apiClient.post<ExplainConceptResponse>('/ai/explain', data);
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to explain concept');
    },
  });

  // Get learning path suggestions
  const { data: learningPath, isLoading: isLoadingLearningPath } = useQuery({
    queryKey: ['learningPath'],
    queryFn: async () => {
      const response = await apiClient.get<LearningPathResponse>('/ai/learning-path');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 1,
  });

  // Check AI service health
  const checkHealth = async () => {
    try {
      const response = await apiClient.get('/ai/health');
      return response.data.status === 'healthy';
    } catch {
      return false;
    }
  };

  return {
    // Mutations
    askQuestion: askQuestion.mutateAsync,
    isAsking: askQuestion.isPending,
    lastAnswer: askQuestion.data,
    
    explainConcept: explainConcept.mutateAsync,
    isExplaining: explainConcept.isPending,
    lastExplanation: explainConcept.data,

    // Queries
    portfolioInsights,
    isLoadingInsights,
    refetchInsights,
    
    learningPath,
    isLoadingLearningPath,
    
    // Utilities
    checkHealth,
  };
};

