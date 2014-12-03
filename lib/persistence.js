function Persistence(){};

Persistence.prototype.initialize = function(name){
    this.name = name;
}

Persistence.prototype.store = function(fn){
    return fn();
}

Persistence.prototype.restore = function(fn){
    return fn();
}

module.exports = Persistence;
