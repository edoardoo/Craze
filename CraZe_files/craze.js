var CrazeApp = function(socket) {
// A Craze 'class', or at least the JS equivalent of a class, which takes an
// argument and initializes it when instantiating.
    this.socket = socket;
}

CrazeApp.prototype.sendMessage = function(text) {
// Send a message, which will contain whatever we want the other clients to
// draw. For now lets leave it just at text, it will become a very complex
// JSON with lots of properties and what we want others to perform.
    var message = {
        text: text
    }
    this.socket.emit('message', message);
}

CrazeApp.prototype.changeRoom = function(room) {
// To change the room the user is currently in.
    var room = {
        newRoom: room
    }
    this.socket.emit('join', room);
}

CrazeApp.prototype.changeName = function(name) {
// To change the nickName the user currently has.
    this.socket.emit('nameAttempt', name);
}

CrazeApp.prototype.getUsers = function() {
// To get the users in the current room.
    this.socket.emit('users');
}

CrazeApp.prototype.processCommand = function(command) {
// To process the commands, for now just changing room or nickname.
    var words = command.split(' ');
    // Splits the string into several strings at the ' ' separator, and
    // then puts them all together into a 'words' list.
    var command = words[0].substring(1, words[0].length).toLowerCase();
    // Remove the first character of the first word, which is '/' in a
    // command, and then make the command completely lowercase.
    var message = false;
    switch(command) {
        case 'join':
            words.shift();
            // Removes the first element of an array, and returns it.
            var room = words.join(' ');
            // Put the words in the list together again with a ' ' between.
            this.changeRoom(room);
            break;
        case 'nick':
            words.shift();
            var name = words.join(' ');
            this.changeName(name);
            break;
        default:
            message = 'Unrecognized command.';
            break;
    }
    return message;
}

/* To Do:
    - Change Rotation Center (maybe a brush that while its selected, every new clicked place is the new center).
    - Move to this class the logic regarding sending messages to the server out of the drawingmaths file.
    -'ARE YOU SURE' dialog when creating a new image.
*/