// var socket = io.connect();
// Create the socket object for this very client.

$(function() {
// When the document is ready, execute this function.
    canvas = new CrazeCanvas();
    canvas.drawNewImage();
    // The object for the canvas.
    // crazeApp = new CrazeApp(socket);
    // The object that will handle communications with the server.
    variableInitializer();
    // Initialize the variables of the application.
    setupEventHandlers();
    // Set up the handlers for all the DOM events.

    // Now, lets define the events/signals that the local socket will handle
    // such will be incoming from the server, via some different channels.
    //
    // socket.on('nameResult', function(result) {
    // // This is the result of a name change attempt.
    //     if(result.success) {
    //         $('#myname').text("Nickname: " + result.name);
    //         // Change your nickname in the button.
    //     }
    //     else {
    //         var message = result.message;
    //         alert(message);
    //     }
    // });
    //
    // socket.on('joinResult', function(result) {
    // // This is the result of changing/creating a new room.
    //     $('#myroom').text("Room: " + result.room);
    // });
    //
    // socket.on('message', function(message) {
    // // This is an incoming message from other users in the same room.
    //     drawOther(message);
    // });
    //
    // socket.on('users', function(message) {
    // // This is the response the socket will receive after requesting
    // // the list of users in this same room.
    //     alert(message.text);
    // });
});
//
// function changeNickName(crazeApp, socket) {
// // For handling nickname changing attempts.
//     var systemMessage;
//     var name = prompt('Please enter your new name', '');
//     if(name == "") {
//         alert("You can't have an empty name!");
//         return;
//     };
//     if(name == null) {
//         return;
//     }
//     systemMessage = crazeApp.processCommand('/nick ' + name);
// }
//
// function changeRoom(crazeApp, socket) {
// // For handling room changing attempts.
//     var systemMessage;
//     var room = prompt('Please enter the target room', '');
//     if(room == "") {
//         alert("You can't join a room with no name!");
//         return;
//     }
//     if(room == null) {
//         return;
//     }
//     systemMessage = crazeApp.processCommand('/join ' + room);
// }

// function divEscapedContentElement(message) {
// // This function will sanitize text by transforming special characters into
// // HTML entities, so that the browser displays them as entered instead of
// // trying to present these as pure HTML code. <script></script> is nasty...
//     return $('<div></div>').text(message);
// }
// // Text data the user inputs is untrusted they may try to XSS or something!
// // <script>alert('XSS attack!');</script>     gets turned into...
// // <div>&lt;script&gt;alert('XSS attack!');&lt/script&gt;</div>
// // We DON'T want people to XSS in their names :-)


function setupEventHandlers() {
// This function sets the event handlers corresponding some actions like
// changing things in the HTML document such as the checkboxes, number
// inputs, sliders, or buttons. Thx @febuiles && JQuery <3
    $("#newImage").click(function() { canvas.drawNewImage(); });
    // When the newImage button is pressed.
    $("#saveImage").click(function() { canvas.saveImage(); });
    // When the saveImage button is pressed.
    $("#craze-btn").click(function() { crazeMode(); });
    // When the craze button is pressed.
    // $("#myname").click(function() { changeNickName(crazeApp, socket) });
    // // When the nickName button is pressed.
    // $("#myroom").click(function() { changeRoom(crazeApp, socket)} );
    // // When the changeRoom button is pressed.
    // $("#getUsers").click(function() { crazeApp.getUsers(); });
    $("#formCraze").submit(function() { return false; });
    // This prevents the form that controls the parameters from submitting.
    $("#symmetry").change(function() { updateSymmetry(); });
    // 'Symmetry' checkbox
    $("#variable").change(function() { updateVariable(); });
    // 'Variable Size' checkbox
    $("#rotating").change(function() { updateRotating(); });
    // 'Rotating Brush' checkbox
    $("#connect").change(function() { updateConnect(); });
    // 'Connecting Borders' checkbox
    $("#fill").change(function() { updateFill(); });
    // 'Shape Fill' checkbox
    $("#fade").change(function() { updateFade(); });
    // 'Fading Image' checkbox
    $("#grid").change(function() { updateGrid(); });
    // 'Fit To Grid' checkbox
    $("#rota").change(function() { updateRotNum(); });
    // 'Rotating Brush' checkbox
    $("#thick").change(function() { updateThick(); });
    // 'Line Thickness' checkbox
    $("#bsize").change(function() { updateSize(); });
    // 'Brush Size' checkbox
    $("#red").change(function() { colorChanged(1,0); });
    // 'Red Color' slider
    $("#gre").change(function() { colorChanged(1,1); });
    // 'Green Color' slider
    $("#blu").change(function() { colorChanged(1,2); });
    // 'Blue Color' slider
    $("#redtxt").change(function() { colorChanged(0,0); });
    // Textfield for Red Color value
    $("#gretxt").change(function() { colorChanged(0,1); });
    // Textfield for Green Color value
    $("#blutxt").change(function() { colorChanged(0,2); });
    // Textfield for Blue Color value
    $("#alpha").change(function(){ alphaChanged(1); });
    // Slider for Transparency (Alpha Channel)
    $("#alphatxt").change(function(){ alphaChanged(0); });
    // Textfield for Transparency (Alpha Channel)
    $("#paletteSelection").change(function() { updatePalette(); });
    // Palette list selection
    $("#brushSelection").change(function() { updateBrush(); });
    // Brush list selection
}

var CrazeCanvas = function() {
// Class for the canvas object.

    var canvas = $("canvas")[0];
    canvas.height = window.innerHeight * 0.93;
    canvas.width  = window.innerWidth * 0.75;
    // Set the canvas dimensions

    this.setStrokeColor = function(color) {
    // A function for setting the stroke color.
        this.getContext().strokeStyle = color;
    }

    this.getStrokeColor = function() {
        return this.getContext().strokeStyle;
    }

    this.getContext = function() {
    // A function for retrieving the 2D context of the canvas.
        return canvas.getContext('2d');
    }

    this.drawNewImage = function() {
    // A function for cleaning the slate and also stop the Craze Mode.
        killCrazeMode();
        this.clearImage();
    }

    this.clearImage = function() {
        this.getContext().globalAlpha = 1.0;
        this.getContext().fillRect(0, 0, canvas.width, canvas.height);
    }

    this.saveImage = function(){
    // A function to save the current image
      killCrazeMode();
      window.open(canvas.toDataURL());
    }

    var cenX = canvas.width/2;
    var cenY = canvas.height/2;
    // Initialize the center of the canvas. Perhaps in the future
    // each person has its own center heh.

    this.getCenter = function() {
    // A function for retrieving the current center of the canvas
        return {
            x: cenX,
            y: cenY
        }
    }

    this.setCenter = function(x,y){
    // A function for setting a new center to the canvas, not used for now.
      cenX = x;
      cenY = y;
    }

    this.width  = function() { return canvas.width;  }
    this.height = function() { return canvas.height; }
    // A couple functions for retrieving the dimensions of the canvas.

    var bindEvents = function() {
    // Now, lets bind some mouse events.
        $("canvas").mousedown(function() {
        // When the Mouse is pressed down on the canvas.
            if(craze){ killCrazeMode(); }
            doMouseDown(event);
        });

        $("canvas").mouseup(function() {
        // When the mouse is released on the canvas.
            doMouseUp(event);
        });

        $("canvas").mousemove(function() {
        // When the mouse is moved over the canvas.
            if(!craze){
                doMouseMove(event);
            }
        });

        $("canvas").mouseout(function(){
        // When the mouse moves out of the canvas, treat as releasing it,
        // for drawing purposes leaving the canvas stops drawing.
            if(!craze){
                doMouseUp(event);
            }
        });
    }
    bindEvents();
}
