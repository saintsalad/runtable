import { createMMKV } from 'react-native-mmkv';

const mmkv = createMMKV({ id: 'runtable' });

export const mmkvStorage = {
  setItem: (name: string, value: string) => {
    mmkv.set(name, value);
  },
  getItem: (name: string): string | null => {
    const v = mmkv.getString(name);
    return v ?? null;
  },
  removeItem: (name: string) => {
    mmkv.remove(name);
  },
};
