import { BehaviorSubject } from "rxjs";
import { api } from "@/lib/client/fetch";

const baseUrl = "/api/users";
const userSubject = new BehaviorSubject<User | null>(null);

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  balance: string;
  level: string;
  code: string;
  token?: string;
}

export const usersClient = {
  user: userSubject.asObservable(),
  get userValue() {
    return userSubject.value;
  },
  async login(email: string, password: string) {
    const user = await api.post<User>(`${baseUrl}/authenticate`, { email, password });
    userSubject.next(user);
    return user;
  },
  async logout() {
    await api.post(`${baseUrl}/logout`, {});
    userSubject.next(null);
    if (typeof window !== "undefined") window.location.href = "/login";
  },
  async register(user: Record<string, unknown>) {
    return api.post(`${baseUrl}/register`, user);
  },
  async getAll() {
    return api.get<User[]>(baseUrl);
  },
  async getAllAgents() {
    return api.get<User[]>(`${baseUrl}/agents`);
  },
  async getById(id: string) {
    return api.get<User>(`${baseUrl}/${id}`);
  },
  async update(id: string, params: Record<string, unknown>) {
    await api.put(`${baseUrl}/${id}`, params);
    if (id === userSubject.value?.id) {
      const user = { ...userSubject.value, ...params } as User;
      userSubject.next(user);
    }
  },
  async delete(id: string) {
    await api.delete(`${baseUrl}/${id}`);
    if (id === userSubject.value?.id) {
      await usersClient.logout();
    }
  },
  async fetchCurrentUser() {
    try {
      const user = await api.get<User>(`${baseUrl}/me`);
      userSubject.next(user);
      return user;
    } catch {
      userSubject.next(null);
      return null;
    }
  },
};
