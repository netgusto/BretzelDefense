import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import timers from '../src/Singleton/timers';

describe('timers', function() {
    beforeEach(function() {
        vi.useFakeTimers({
            toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'performance']
        });
    });

    afterEach(function() {
        timers.removeAll();
        vi.useRealTimers();
    });

    it('keeps interval cadence after pause and resume', function() {
        const ticks = [];
        const timerid = timers.addInterval(function() {
            ticks.push(performance.now());
        }, 1000);

        vi.advanceTimersByTime(2500);
        expect(ticks).toHaveLength(2);

        timers.pause(timerid);

        vi.advanceTimersByTime(5000);
        expect(ticks).toHaveLength(2);

        timers.resume(timerid);

        vi.advanceTimersByTime(499);
        expect(ticks).toHaveLength(2);

        vi.advanceTimersByTime(1);
        expect(ticks).toHaveLength(3);

        vi.advanceTimersByTime(1000);
        expect(ticks).toHaveLength(4);

        vi.advanceTimersByTime(1000);
        expect(ticks).toHaveLength(5);
    });
});
