import { vi } from 'vitest';
import { mockTranslations } from './tiers.fixtures';

export const mockedTranslationFn = vi
  .fn()
  .mockImplementation(
    (key: string, { defaultValue }) => mockTranslations[key as keyof typeof mockTranslations] ?? defaultValue ?? key,
  );
