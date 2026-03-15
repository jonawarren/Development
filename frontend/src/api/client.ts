import type { SessionCreated, SessionStatus, SurveyInfo, SurveySubmit, RecommendationResponse } from '../types';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const method = options?.method ?? 'GET';
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (err) {
    console.error('[API network error]', method, path, err);
    throw err;
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const message = err.detail || `HTTP ${res.status}`;
    console.error('[API error]', method, path, res.status, message);
    throw new Error(message);
  }
  return res.json();
}

export const api = {
  createSession: (): Promise<SessionCreated> =>
    request('/sessions', { method: 'POST', body: '{}' }),

  getSessionStatus: (sessionId: string): Promise<SessionStatus> =>
    request(`/sessions/${sessionId}/status`),

  getSurvey: (token: string): Promise<SurveyInfo> =>
    request(`/surveys/${token}`),

  submitSurvey: (token: string, data: SurveySubmit): Promise<{ session_id: string; status: string }> =>
    request(`/surveys/${token}`, { method: 'POST', body: JSON.stringify(data) }),

  getRecommendations: (sessionId: string, latitude: number, longitude: number): Promise<RecommendationResponse> =>
    request('/recommendations', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, latitude, longitude }),
    }),
};
