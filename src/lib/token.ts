const KEY = 'access_token'

export const tokenStorage = {
  get: () => localStorage.getItem(KEY),
  set: (token: string) => localStorage.setItem(KEY, token),
  remove: () => localStorage.removeItem(KEY),
}
