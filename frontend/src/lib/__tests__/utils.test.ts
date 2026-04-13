import { cn, formatDate, formatTime, sleep, debounce } from '@/lib/utils';

describe('Utils', () => {
  describe('cn (class name merger)', () => {
    test('merges class names correctly', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe(
        'text-red-500 bg-blue-500'
      );
    });

    test('handles conditional classes', () => {
      expect(cn('base-class', true && 'conditional-class')).toBe(
        'base-class conditional-class'
      );
      expect(cn('base-class', false && 'conditional-class')).toBe('base-class');
    });

    test('merges conflicting Tailwind classes', () => {
      // twMerge should keep the last conflicting class
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
      expect(cn('p-4', 'p-8')).toBe('p-8');
    });

    test('handles arrays and objects', () => {
      expect(cn(['text-red-500', 'bg-blue-500'])).toBe(
        'text-red-500 bg-blue-500'
      );
      expect(cn({ 'text-red-500': true, 'bg-blue-500': false })).toBe(
        'text-red-500'
      );
    });
  });

  describe('formatDate', () => {
    test('formats Date object correctly', () => {
      const date = new Date('2023-12-25T10:00:00Z');
      const formatted = formatDate(date);
      expect(formatted).toBe('December 25, 2023');
    });

    test('formats date string correctly', () => {
      const formatted = formatDate('2023-12-25T10:00:00Z');
      expect(formatted).toBe('December 25, 2023');
    });

    test('handles different date formats', () => {
      // Use a more specific date to avoid timezone issues
      const formatted = formatDate('2023-06-15T12:00:00Z');
      expect(formatted).toBe('June 15, 2023');
    });
  });

  describe('formatTime', () => {
    test('formats Date object correctly', () => {
      const date = new Date('2023-12-25T14:30:00Z');
      const formatted = formatTime(date);
      // Note: This will vary by timezone, so we just check the format
      expect(formatted).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/);
    });

    test('formats time string correctly', () => {
      const formatted = formatTime('2023-12-25T09:15:00Z');
      expect(formatted).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/);
    });
  });

  describe('sleep', () => {
    test('resolves after specified time', async () => {
      const start = Date.now();
      await sleep(100);
      const elapsed = Date.now() - start;

      // Allow some tolerance for timing
      expect(elapsed).toBeGreaterThanOrEqual(95);
      expect(elapsed).toBeLessThan(150);
    });

    test('resolves with no value', async () => {
      const result = await sleep(1);
      expect(result).toBeUndefined();
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('delays function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1');
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith('arg1');
    });

    test('cancels previous call when called again', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1');
      debouncedFn('arg2');
      debouncedFn('arg3');

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg3');
    });

    test('handles multiple arguments', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 50);

      debouncedFn('arg1', 'arg2', 'arg3');
      jest.advanceTimersByTime(50);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });

    test('executes multiple times with sufficient delay', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('call1');
      jest.advanceTimersByTime(100);

      debouncedFn('call2');
      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenNthCalledWith(1, 'call1');
      expect(mockFn).toHaveBeenNthCalledWith(2, 'call2');
    });
  });
});
