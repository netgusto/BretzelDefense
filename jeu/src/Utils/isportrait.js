
let mql = null;
let isportrait = false;

export default function() {

    if(mql === null && 'matchMedia' in window) {
        mql = window.matchMedia('(orientation: portrait)');
        isportrait = !!mql.matches;
        mql.addListener(function(/*m*/) {
            isportrait = !!mql.matches;
        });
    }

    return isportrait;
}