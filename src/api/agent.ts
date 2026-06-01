import { request } from './http'
import type {
  DecisionPayload,
  DecisionResponse,
  TaskStatusResponse,
  TaskInputPayload,
} from '../types/agent'

export function submitDecision(token: string, payload: DecisionPayload) {
  return request<DecisionResponse>({
    path: '/api/v1/agent/decision',
    method: 'POST',
    token,
    body: payload,
  })
}

export function getTaskStatus(token: string, taskId: string) {
  return request<TaskStatusResponse>({
    path: `/api/v1/agent/tasks/${taskId}`,
    token,
  })
}

export function submitTaskInput(token: string, taskId: string, payload: TaskInputPayload) {
  return request<null>({
    path: `/api/v1/agent/tasks/${taskId}/input`,
    method: 'POST',
    token,
    body: payload,
  })
}

export function closeAgentSession(token: string) {
  return request<null>({
    path: '/api/v1/agent/session',
    method: 'DELETE',
    token,
  })
}
