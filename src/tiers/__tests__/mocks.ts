import { mockTranslations } from './tiers.fixtures';

export const mockedTranslationFn = jest
  .fn()
  .mockImplementation(
    (key: string, { defaultValue }) => mockTranslations[key as keyof typeof mockTranslations] ?? defaultValue ?? key,
  );
