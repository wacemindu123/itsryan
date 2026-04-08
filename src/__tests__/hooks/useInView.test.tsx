import { renderHook, act } from '@testing-library/react';
import { useInView } from '@/hooks/useInView';

// ── Mock IntersectionObserver ────────────────────────────────────────

let observerCallback: IntersectionObserverCallback;
let mockDisconnect: jest.Mock;

beforeEach(() => {
  mockDisconnect = jest.fn();

  global.IntersectionObserver = jest.fn((cb: IntersectionObserverCallback) => {
    observerCallback = cb;
    return {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: mockDisconnect,
      root: null,
      rootMargin: '',
      thresholds: [],
      takeRecords: jest.fn(),
    };
  }) as unknown as typeof IntersectionObserver;
});

function simulateIntersection(isIntersecting: boolean) {
  act(() => {
    observerCallback(
      [{ isIntersecting } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );
  });
}

describe('useInView', () => {
  it('returns false initially', () => {
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useInView(ref));
    expect(result.current).toBe(false);
  });

  it('returns true when element intersects', () => {
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useInView(ref));

    simulateIntersection(true);

    expect(result.current).toBe(true);
  });

  it('disconnects observer after intersection', () => {
    const ref = { current: document.createElement('div') };
    renderHook(() => useInView(ref));

    simulateIntersection(true);

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('does not fire when element is not intersecting', () => {
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useInView(ref));

    simulateIntersection(false);

    expect(result.current).toBe(false);
  });

  it('handles null ref gracefully', () => {
    const ref = { current: null };
    const { result } = renderHook(() => useInView(ref));
    expect(result.current).toBe(false);
  });

  it('disconnects on unmount', () => {
    const ref = { current: document.createElement('div') };
    const { unmount } = renderHook(() => useInView(ref));

    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
