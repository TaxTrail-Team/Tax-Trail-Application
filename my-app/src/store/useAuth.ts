import { create } from 'zustand';
import { account, } from '../lib/appwrite';
import { ID } from 'appwrite';
import { getOnboardedFlag, setOnboardedFlag } from '../lib/storage';

type AuthState = {
  user: any | null;
  loading: boolean;
  onboarded: boolean;
  setOnboarded: (v: boolean) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  bootstrap: () => Promise<void>;
};

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  onboarded: false,
  async setOnboarded(v) { await setOnboardedFlag(v); set({ onboarded: v }); },
  async bootstrap() {
    const ob = await getOnboardedFlag();
    try {
      const u = await account.get();
      set({ user: u, onboarded: ob, loading: false });
    } catch {
      set({ user: null, onboarded: ob, loading: false });
    }
  },
  async signup(email, password) {
    await account.create(ID.unique(), email, password);
    await get().login(email, password);
  },
  async login(email, password) {
    await account.createEmailSession(email, password);
    const u = await account.get();
    set({ user: u });
  },
  async logout() {
    await account.deleteSessions();
    set({ user: null });
  }
}));
