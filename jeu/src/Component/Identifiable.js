'use strict';

const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

const Identifiable = stampit()
    .init(function() {
        this.declareImplements('Identifiable');
    })
    .props({
        id: null
    })
    .init(function() {
        if(!this.id) { this.id = uuid(); }
    }).methods({
        getId() {
            return this.id;
        }
    });

export default Identifiable;
