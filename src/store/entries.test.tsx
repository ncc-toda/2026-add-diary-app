import { act, renderHook } from '@testing-library/react-native';

import { EntriesProvider, useEntries } from './entries';

function wrap({ children }: { children: React.ReactNode }) {
  return <EntriesProvider>{children}</EntriesProvider>;
}

describe('useEntries', () => {
  it('starts with the seeded entries', () => {
    const { result } = renderHook(() => useEntries(), { wrapper: wrap });
    expect(result.current.entries).toHaveLength(5);
  });

  it('prepends a new entry when addEntry is called', () => {
    const { result } = renderHook(() => useEntries(), { wrapper: wrap });

    act(() => {
      result.current.addEntry({
        mood: '🧪',
        title: 'テストエントリ',
        body: 'jest からの追加',
      });
    });

    expect(result.current.entries).toHaveLength(6);
    expect(result.current.entries[0]).toMatchObject({
      mood: '🧪',
      title: 'テストエントリ',
      body: 'jest からの追加',
    });
  });

  it('throws when used outside the provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useEntries())).toThrow(
      /useEntries must be used inside/,
    );
    spy.mockRestore();
  });
});
