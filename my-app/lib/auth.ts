// lib/auth.ts
import { getItem, setItem } from './storage';

type User = { email: string; password: string; name?: string };
const USERS_KEY = 'taxtrail_users';
const SESSION_KEY = 'taxtrail_session';

// Seed with one demo user if no users saved yet
async function ensureSeedUser() {
  const users = (await getItem<User[]>(USERS_KEY)) ?? [];
  if (users.length === 0) {
    users.push({ email: 'demo@taxtrail.app', password: 'demo123', name: 'Demo User' });
    await setItem(USERS_KEY, users);
  }
}

export async function signUp(email: string, password: string, name?: string) {
  await ensureSeedUser();
  const users = (await getItem<User[]>(USERS_KEY)) ?? [];
  const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) throw new Error('User already exists');
  users.push({ email, password, name });
  await setItem(USERS_KEY, users);
  await setItem(SESSION_KEY, { email });
  return { email, name };
}

export async function signIn(email: string, password: string) {
  await ensureSeedUser();
  const users = (await getItem<User[]>(USERS_KEY)) ?? [];
  const match = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!match) throw new Error('Invalid credentials');
  await setItem(SESSION_KEY, { email: match.email });
  return { email: match.email, name: match.name };
}

export async function getSession() {
  return (await getItem<{ email: string }>(SESSION_KEY)) ?? null;
}

export async function signOut() {
  await setItem(SESSION_KEY, null);
}
