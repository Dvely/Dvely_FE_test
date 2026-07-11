import { request } from './http'
import type {
  ConversationResponse,
  MessageResponse,
  SendMessagePayload,
} from '../types/chat'

export function listConversations(token: string, projectId: string) {
  return request<ConversationResponse[]>({
    path: `/api/v1/projects/${projectId}/conversations`,
    token,
  })
}

export function createConversation(token: string, projectId: string) {
  return request<ConversationResponse>({
    path: `/api/v1/projects/${projectId}/conversations`,
    method: 'POST',
    token,
  })
}

export function getConversation(token: string, conversationId: string) {
  return request<ConversationResponse>({
    path: `/api/v1/conversations/${conversationId}`,
    token,
  })
}

export function deleteConversation(token: string, conversationId: string) {
  return request<void>({
    path: `/api/v1/conversations/${conversationId}`,
    method: 'DELETE',
    token,
  })
}

export function listTrashConversations(token: string) {
  return request<ConversationResponse[]>({
    path: '/api/v1/trash/conversations',
    token,
  })
}

export function restoreConversation(token: string, conversationId: string) {
  return request<ConversationResponse>({
    path: `/api/v1/trash/conversations/${conversationId}/restore`,
    method: 'POST',
    token,
  })
}

export function permanentlyDeleteConversation(token: string, conversationId: string) {
  return request<void>({
    path: `/api/v1/trash/conversations/${conversationId}`,
    method: 'DELETE',
    token,
  })
}

export function listMessages(token: string, conversationId: string) {
  return request<MessageResponse[]>({
    path: `/api/v1/conversations/${conversationId}/messages`,
    token,
  })
}

export function sendMessage(
  token: string,
  conversationId: string,
  payload: SendMessagePayload,
) {
  return request<MessageResponse>({
    path: `/api/v1/conversations/${conversationId}/messages`,
    method: 'POST',
    token,
    body: payload,
  })
}
