import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPendingSurveys, submitSurveyAnswer } from '../api/surveys';

export const SURVEYS_QUERY_KEY = ['surveys', 'pending'];

/**
 * Hook to query pending surveys for a project
 * @param {string|number} projectId
 * @param {boolean} enabled
 */
export function usePendingSurveys(projectId, enabled = true) {
  return useQuery({
    queryKey: [...SURVEYS_QUERY_KEY, projectId],
    queryFn: () => fetchPendingSurveys(projectId),
    enabled: Boolean(projectId) && enabled,
    staleTime: 1000 * 60 * 3, // 3 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to submit a survey answer
 */
export function useSubmitSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recipientId, optionId }) => submitSurveyAnswer(recipientId, optionId),
    onSuccess: (_data, variables) => {
      // Invalidate pending surveys query so fresh state is fetched if needed
      queryClient.invalidateQueries({ queryKey: SURVEYS_QUERY_KEY });
    },
  });
}
