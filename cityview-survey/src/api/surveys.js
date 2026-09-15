import apiClient from './client';
import { isDemoMode } from '../utils/session';

// Sample fallback payload matching API specification for preview/testing
const DEMO_SURVEYS_PAYLOAD = {
  message: 'Pending surveys fetched successfully',
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      recipient_id: 33,
      survey_id: 7,
      survey_name: 'Q1 Development Intent Survey',
      question: 'When do you plan to commence development?',
      remark: 'You are allowed a grace period to begin development. If development does not start within this time, your allocated plot may be reassigned.',
      unit_identifier: '2 Bedroom Apartment, The Lakeside Estate',
      options: [
        {
          id: 1,
          label: 'A year from now',
          order: 0,
        },
        {
          id: 2,
          label: 'In 2-3 years',
          order: 1,
        },
        {
          id: 3,
          label: "I don't know yet",
          order: 2,
        },
      ],
    },
    {
      recipient_id: 41,
      survey_id: 9,
      survey_name: 'Fractional Interest Survey',
      question: 'Would you consider fractional ownership on your next unit?',
      remark: null,
      unit_identifier: 'Studio Apartment, Astrid 2.0',
      options: [
        {
          id: 10,
          label: 'Yes',
          order: 0,
        },
        {
          id: 11,
          label: 'No',
          order: 1,
        },
        {
          id: 12,
          label: 'Maybe',
          order: 2,
        },
      ],
    },
  ],
};

/**
 * Fetches pending surveys for a given project_id.
 * Endpoint: GET /surveys/pending/?project_id={id}
 *
 * @param {string|number} projectId
 * @returns {Promise<{ message: string, count: number, results: Array<SurveyResult> }>}
 */
export async function fetchPendingSurveys(projectId) {
  if (isDemoMode()) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return DEMO_SURVEYS_PAYLOAD;
  }

  if (!projectId) {
    throw new Error('Project ID is required to fetch pending surveys.');
  }

  const response = await apiClient.get(`surveys/pending/?project_id=${encodeURIComponent(projectId)}`);
  const data = response.data;

  // 10x Resilient Normalization:
  // Ensure every survey item has an authoritative recipient_id mapped from the API payload
  if (data && Array.isArray(data.results)) {
    data.results = data.results.map((survey) => {
      const resolvedRecipientId =
        survey.recipient_id ??
        survey.recipientId ??
        survey.recipient?.id ??
        data.recipient_id ??
        data.recipientId ??
        null;

      return {
        ...survey,
        recipient_id: resolvedRecipientId,
      };
    });
  }

  return data;
}

/**
 * Submits an answer for a specific survey recipient.
 * Endpoint: POST /surveys/{recipient_id}/submit/
 *
 * @param {string|number} recipientId - Authoritatively retrieved from fetched survey data
 * @param {number} optionId
 * @returns {Promise<any>}
 */
export async function submitSurveyAnswer(recipientId, optionId) {
  if (isDemoMode()) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { message: 'Survey response submitted successfully' };
  }

  if (recipientId === undefined || recipientId === null || recipientId === '') {
    throw new Error('Recipient ID was not found in fetched survey data. Cannot submit without a valid recipient.');
  }
  if (optionId === undefined || optionId === null) {
    throw new Error('An option selection is required.');
  }

  const response = await apiClient.post(`surveys/${encodeURIComponent(recipientId)}/submit/`, {
    option_id: Number(optionId),
  });

  return response.data;
}
