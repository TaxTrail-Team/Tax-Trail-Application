import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getOnboardedFlag() {
  const v = await AsyncStorage.getItem('onboarded');
  return v === '1';
}
export async function setOnboardedFlag(v: boolean) {
  await AsyncStorage.setItem('onboarded', v ? '1' : '0');
}
// Budget filter session persistence
export type BudgetFilters = {
  years?: number[];
  categories?: string[];
  minAmount?: number | null;
  maxAmount?: number | null;
};

const BUDGET_FILTERS_KEY = 'budget:filters:v1';

export async function getBudgetFilters(): Promise<BudgetFilters | null> {
  try {
    const raw = await AsyncStorage.getItem(BUDGET_FILTERS_KEY);
    return raw ? (JSON.parse(raw) as BudgetFilters) : null;
  } catch {
    return null;
  }
}

export async function setBudgetFilters(filters: BudgetFilters) {
  await AsyncStorage.setItem(BUDGET_FILTERS_KEY, JSON.stringify(filters));
}

export async function clearBudgetFilters() {
  await AsyncStorage.removeItem(BUDGET_FILTERS_KEY);
}