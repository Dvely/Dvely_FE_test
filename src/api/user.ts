import { request } from './http'
import type { UserResponse } from '../types/user'

export function getMe(token: string) {
  return request<UserResponse>({ path: '/api/v1/users/me', token })
}
