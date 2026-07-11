import { request } from './http'
import type {
  DecisionPayload,
  DecisionResponse,
  TaskStatusResponse,
  TaskInputPayload,
  AgentTaskEventResponse,
} from '../types/agent'

export function submitDecision(token: string, payload: DecisionPayload) {
  return request<DecisionResponse>({
    path: '/api/v1/agent/decision',
    method: 'POST',
    token,
    body: payload,
  })
}

export function getTaskEvents(token: string, taskId: string, afterEventId: string) {
  const query = afterEventId.trim()
    ? `?afterEventId=${encodeURIComponent(afterEventId)}`
    : ''
  return request<AgentTaskEventResponse[]>({
    path: `/api/v1/agent/tasks/${taskId}/events${query}`,
    token,
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

export function cancelTask(token: string, taskId: string) {
  return request<void>({
    path: `/api/v1/agent/tasks/${taskId}`,
    method: 'DELETE',
    token,
  })
}

export function retryTask(token: string, taskId: string) {
  return request<void>({
    path: `/api/v1/agent/tasks/${taskId}/retry`,
    method: 'POST',
    token,
  })
}
