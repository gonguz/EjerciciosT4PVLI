// By Carlos León, 2016
// Licensed under Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)

'use strict';

//////////////////////////////////////////////////////////////////////////////

// Entity type to differentiate entities and have them attack those not
// belonging to the same kind
var EntityType = {
    GOOD: 0,
    EVIL: 1
};

// Entity constructor
// 
// Entities have a name (it doesn't have to be unique, but it helps) and a type
//
// Additionally, entities accept a list of instantiated components
function Entity(entityName, entityType, components) {
    var self = this;
    this.entityName = entityName;

    // Instead of assigning the parameter, we call `addComponent`, which is a
    // bit smarter than default assignment
    this.components = [];
    components.forEach(function(component) {
        self.addComponent(component);
    });
    this.type = entityType;
}

Entity.prototype.addComponent = function(component) {
    this.components.push(component);
    component.entity = this;
};

// This function delegates the tick on the components, gathering their messages
// and aggregating them into a single list of messages to be delivered by the
// message manager (the game itself in this case
Entity.prototype.tick = function() {
    var outcoming = [];
    this.components.forEach(function(component) {
        var messages = component.tick();
        messages.forEach(function (message) {
            outcoming.push(message);
        });
    });
    return outcoming;
};

// All received messages are forwarded to the components
Entity.prototype.receive = function(message) {
    // If the receiver is `null`, this is a broadcast message that must be
    // accepted by all entities
    if(!message.receiver || message.receiver === this) {
        this.components.forEach(function(component) {
            component.receive(message);
        });
    }
};
//////////////////////////////////////////////////////////////////////////////
// if the receiver is null, it is a broadcast message
function Message(receiver) {
    this.receiver = receiver;
}

//////////////////////////////////////////////////////////////////////////////
function Component(entity) {
    this.entity = entity;
    this.messageQueue = [];
}

Component.prototype.tick = function() { //AQUI LOCO 
    // We return a copy of the `messageQueue`, and we empty it
    var aux = this.messageQueue;
    this.messageQueue = [];
    return aux;
};
Component.prototype.receive = function(message) {
};


//////////////////////////////////////////////////////////////////////////////

function Game(entities) {
    this.entities = entities;
    this.messageQueue = [];
}

Game.prototype.mainLoop = function (ticks) {
    var i = 0;
    function line() {
        console.log("-----------------------------------------");
    }
    while(!ticks || i < ticks) {
        line();
        console.log("Tick number " + i);
        line();
        this.tick();
        i++;
    }
};

// Each tick, all entities are notified by calling their `tick` function
Game.prototype.tick = function () {
    var self = this;
    // All messages coming from the entities are put in the queue
    this.entities.forEach(function(entity) {
        var tickMessages = entity.tick();

        tickMessages.forEach(function(tickMessage) {
            self.messageQueue.push(tickMessage);
        });
    });

    this.deliver();
};


// All messages in the queue are delivered to all the entities
Game.prototype.deliver = function() {
    var self = this;

    this.messageQueue.forEach(function(message) {
        if(!message.receiver) {         
            self.entities.forEach(function(entity) {
                entity.receive(message);
            });
        }
        else {
            message.receiver.receive(message);
        }
    });

    this.messageQueue = [];
};

//////////////////////////////////////////////////////////////////////////////
// COMPONENTES 
//////////////////////////////////////////////////////////////////////////////
// EJERCICIO 3
/* Modificamos Game.prototype.tick = function () ... para que no lance el mensaje
PRESENCE  para cada entidad en cada tick
Luego en cada entidad una vez que no este en estado de Sleep lanzara el mensaje PRESENCE
para informar de que esta activa
*/
//////////////////////////////////////////////////////////////////////////////
function Attacker(entity) {
    Component.call(this, entity);
    var Sleep= true;

}
Attacker.prototype = Object.create(Component.prototype);
Attacker.prototype.constructor = Attacker;

Attacker.prototype.receive = function(message) {
    if( Sleep ){
        if (message instanceof WakeUp)
            Sleep = false;
    }
    else {
            self.messageQueue.push(new Presence(entity));
            if(message.who.type != this.entity.type){
                this.messageQueue.push(new Attack(this.entity, message.who));
            }
        
    }
    
};

//////////////////////////////////////////////////////////////////////////////
function Defender(entity) {
    Component.call(this, entity);
    var Sleep = true;
}
Defender.prototype = Object.create(Component.prototype);
Defender.prototype.constructor = Defender;

Defender.prototype.receive = function(message) {
    if(Sleep){
        if(message instance of WakeUp)
            Sleep = false;
    }
    else{
        self.messageQueue.push(new Presence(entity));
        if (message instanceof Attacker){
            console.log(this.entity.entityName + "was attacked by " + message.who.entityName);
        }
    }
};
/////////////////////////////////////////////////////////////////////////////
/* EJERCICIO DOS EXPLICACION 
Creamos la componnente Salud y la componente de Curarcion. La componente de Salud recibe los atributos de componente
y se crea a partir del prototipo de ese mismo componente, ademas hemos añadido la variable vida que inicialmente sera 100.
Si el prototypo recibe un mensaje del componente curar, entonces aumenta la salud.
Mientras, el componente curar recibe los atributos de componente y se crea, al igual que el componente Salud, a partir del
prototipo de ese mismo componente. Esta componente enviara con Presence, en cada tick comprobando si existe esta entidad
,un mensaje para curar. */
/////////////////////////////////////////////////////////////////////////////
function Health(entity){
    Component.call(this, entity);
    var health = 100;
}
Health.prototype = Object.create(Component.prototype);
Health.prototype.constructor =  Health;

Health.prototype.receive = function(message){
    if(message instanceof Healer){
        health+=10;
        console.log(this.entity.entityName + " was healed ");
    }
}
//////////////////////////////////////////////////////////////////////////
function Healer(entity){
    Component.call(this, entity);
    var Sleep = true;
}
Healer.prototype = Object.create(Component.prototype);
Healer.prototype.constructor = Healer;

Healer.prototype.receive = function(message){
 if(Sleep){
        if(message instanceof WakeUp)
            Sleep = false ;
    }
    else{
        self.messageQueue.push(new Presence(entity));
        if(message.who.type != this.entity.type){
            this.message.Queue.psuh(new Healer(this.entity, message.who));
            }
    }
}
///////////////////////////////////////////////////////////////////////////////
function Movable(entity){
    Component.call(this, entity);
    var Sleep = false;
}
Movable.prototype = Object.create(Component.prototype);
Movable.prototype.constructor = Movable;

Movable.prototype.receive = function(message){
    if(Sleep){
        if(message instanceof WakeUp)
            Sleep = false;
    }
    else{
        console.log(this.entity.entityName + "I'm moving")
    }
}   
//////////////////////////////////////////////////////////////////////////////
function Physical(entity){
    Component.call(this, entity);
    var Sleep = false;
    var x=100;
    var y=100;
}
Physical.prototype = Object.create(Component.prototype);
Physical.prototype.constructor = Physical;

Physical.prototype.receive = function(message){
    if(Sleep){
        if(message instanceof WakeUp)
            Sleep = false;
    }
    else{
        console.log(this.entity.entityName + "I'm Physical")
    }
}
//////////////////////////////////////////////////////////////////////////////
// Messages
//////////////////////////////////////////////////////////////////////////////
function Presence(who, receiver) {
    Message.call(this, receiver);
    this.who = who;
}
Presence.prototype = Object.create(Message.prototype);
Presence.prototype.constructor = Presence;
//////////////////////////////////////////////////////////////////////////////
function Attack(who, receiver) {
    Message.call(this, receiver);
    this.who = who;
}
Attack.prototype = Object.create(Message.prototype);
Attack.prototype.constructor = Attack;
//EJERCICIO 1 : Creo la funcion Sleep dandole solo el receptor del mensaje
//, siguiendo el ejemplo de la funcion Attack creamos el objeto y el constructor

function Sleep(receiver){ 
    Message.call(this, receiver);
}
Sleep.prototype = Object.create(Message.prototype);
Sleep.prototype.constructor = Sleep ;
//Lo mismo para crear el tipo de mensaje de WakeUp
function WakeUp(receiver){
    
    Message.call(this, receiver);
}
WakeUp.prototype = Object.create(Message.prototype);
WakeUp.prototype.constructor = WakeUp;
//////////////////////////////////////////////////////////////////////////////



// helper functions creating new components
var attacker = function() { return new Attacker(); };
var defender = function() { return new Defender(); };

// entities in the game
var link = new Entity("link", EntityType.GOOD, [attacker(), defender()]);
var ganon = new Entity("ganon", EntityType.EVIL, [attacker(), defender()]);
var octorok = new Entity("octorok", EntityType.EVIL, [defender()]);
var armos = new Entity("armos", EntityType.EVIL, [attacker()]);

// we create the game with the entities
var game = new Game([link, ganon, armos, octorok]);

game.mainLoop(10);
