var paused            = false;
var previousTimestamp = 0;

var pageAnchors       = [];
var currentAnchor     = 0;

var oldGamepad    = {};
var gamepad       = {};
var axesThreshold = 0.5;

function prepare() {
    //register

    document.addEventListener("gamepadConnected",gamepadConnected,false);
    document.addEventListener("gamepadDisconnected",gamepadDisconnected,false);
    document.addEventListener("gamepadButtonDown",gamepadButtonDown,false);
    document.addEventListener("gamepadButtonUp",gamepadButtonUp,false);
    document.addEventListener("gamepadAxesMoved",gamepadAxesMoved,false);
    pollConnect();
}

function pollConnect() {
    if (!!navigator.webkitGetGamepads()[0]) {
        var evt = document.createEvent("Event");;
        evt.initEvent("gamepadConnected",true,true);
        document.dispatchEvent(evt);
    } else {
        window.requestAnimationFrame(pollConnect);
    }
}

function gamepadConnected(event) {
    console.log("Gamepad connected successfully!");
    pageAnchors = getPageAnchors();
    window.requestAnimationFrame(pollGamepad);
}

function gamepadDisconnected(event) {
    console.log("Gamepad disconnected - attempting to reconnect.");
    window.requestAnimationFrame(pollConnect);
}

function gamepadButtonDown(event) {
    console.log("ButtonDown event fired! Keycode: " + event.keycode);
}

function gamepadButtonUp(event) {
    console.log("ButtonUp event fired! Keycode: " + event.keycode);
}

function fireEvent( type  ) {
    var evt = document.createEvent("Event");
    evt.initEvent(type,true,true);
    document.dispatchEvent(evt);
}

//TODO: Fix these^ Make them one! 
function buttonEvent( type, keycode ) {
    var evt = document.createEvent("Event");
    evt.keycode = keycode;
    evt.initEvent(type,true,true);
    document.dispatchEvent(evt);
}

function pollGamepad() {
    gamepad = navigator.webkitGetGamepads()[0];
   
    if (!gamepad) { 
        fireEvent('gamepadDisconnected');
        return;
    }

    if ( previousTimestamp != gamepad.timestamp 
                && (!oldGamepad || !compareArray(oldGamepad.buttons, gamepad.buttons)) ) { 

        for ( var i = 0; i < gamepad.buttons.length; i++ ) {
            if ( gamepad.buttons[i] > 0.5 && (!oldGamepad || oldGamepad.buttons[i] < 0.5) ) {
                buttonEvent('gamepadButtonDown', i)
            }
            else if ( oldGamepad.buttons && oldGamepad.buttons[i] > 0.5 && gamepad.buttons[i] < 0.5) {
                buttonEvent('gamepadButtonUp', i)
            }
        }

        oldGamepad.buttons = gamepad.buttons.slice();
        previousTimestamp = gamepad.timestamp;
    }

    window.requestAnimationFrame(pollGamepad);
}

function getPageAnchors() {
    var validAnchors = [];
    var anchors = document.getElementsByTagName('a');
    for ( anchor in anchors ) {
        var href = anchors[anchor].href;

        if (!href) 
            continue

        if ( href.indexOf('#') != -1 ) 
            continue;

        validAnchors.push( anchors[anchor] );
    }
    return validAnchors;
}

//Helper functions

function compareArray (a, b) {
    // if the other array is a falsy value, return
    if (!a || !b)
        return false;

    // compare lengths - can save a lot of time
    if (a.length != b.length)
        return false;

    for (var i = 0; i < a.length; i++) {
        // Check if we have nested arrays
        if (a[i] instanceof Array && b[i] instanceof Array) {
            // recurse into the nested arrays
            if ( !compareArray(a[i], b[i]) ) 
                return false;
        }
        else if (a[i] != b[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}

function toArray(nl) {
    for(var a=[], l=nl.length; l--; a[l]=nl[l]);
    return a;
}

prepare();
