let timerid = 0;
const timers = [];

function addTimer(func, ms, type) {
    let consume;

    if(type === 't') {
        consume = function(tid) {
            this.remove(tid);
            func();
        }.bind(this, timerid);
    } else {
        consume = function(tid) {
            timers[tid].start = performance.now();
            timers[tid].remaining = timers[tid].delay;
            func();
        }.bind(this, timerid);
    }

    const handle = (type === 't') ? window.setTimeout(consume, ms) : window.setInterval(consume, ms);

    timers[timerid] = {
        type,
        handle,
        func: consume,
        start: performance.now(),
        delay: ms,
        remaining: ms
    };

    return timerid++;
}

export default {
    addTimeout(func, ms) {
        return addTimer.apply(this, [func, ms, 't']);
    },
    addInterval(func, ms) {
        return addTimer.apply(this, [func, ms, 'i']);
    },
    pause(tid) {
        if(!(tid in timers)) return false;

        window.clearTimeout(timers[tid].handle);
        window.clearInterval(timers[tid].handle);

        timers[tid].remaining -= (performance.now() - timers[tid].start);
        if(timers[tid].remaining < 0) {
            timers[tid].remaining = 0;
        }

        return timers[tid].remaining;
    },
    resume(tid) {
        if(!(tid in timers)) return false;

        timers[tid].start = performance.now();

        if(timers[tid].type === 't') {
            // timeout
            window.clearTimeout(timers[tid].handle);
            window.clearInterval(timers[tid].handle);
            timers[tid].handle = window.setTimeout(timers[tid].func, timers[tid].remaining);
        } else {
            // interval
            window.clearTimeout(timers[tid].handle);
            window.clearInterval(timers[tid].handle);

            timers[tid].handle = window.setTimeout(function() {
                if(!(tid in timers)) {
                    return;
                }

                timers[tid].func();

                if(!(tid in timers)) {
                    return;
                }

                timers[tid].start = performance.now();
                timers[tid].remaining = timers[tid].delay;
                timers[tid].handle = window.setInterval(timers[tid].func, timers[tid].delay);
            }, timers[tid].remaining);
        }

        return timers[tid].remaining;
    },
    remove(tid) {
        if(!(tid in timers)) return false;

        window.clearTimeout(timers[tid].handle);
        window.clearInterval(timers[tid].handle);

        delete timers[tid];

        return true;
    },
    pauseAll() {
        timers.map((timer, tid) => {
            if(!timer) return;
            this.pause(tid);
        });

        console.log(timers);
    },
    resumeAll() {
        timers.map((timer, tid) => {
            if(!timer) return;
            this.resume(tid);
        });
    },
    removeAll() {
        timers.map((timer, tid) => {
            if(!timer) return;
            this.remove(tid);
        });
    }
};
