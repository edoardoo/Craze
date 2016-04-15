var colors = ['red', 'gre', 'blu'];           // The three basic color prefixes, useful for assembling dynamically
                                              // .. the name of whatever DOM element of a color we want to access.

var craze;                                    // a boolean that determines whether CraZe Mode its on or off
var intv;                                     // interval that manipulates a fake coordinate forCraZe Mode

var intvPoint;                                // a variable to store a IntvCoord object

var IntvCoord = function(){                   // IntvCoord object is a coordinate that passes as a fake mouse
                                              // coordinate forcalling the methods related to moving the mouse
                                              // with it, making the program think the mouse was moved the mouse,
                                              // but its really a fake coordinate manipulated inside a interval
                                              // This is useful for Craze Mode, which draws on its own but uses
                                              // The same methods that would be used while drawing with the mouse.
  var pageX, pageY;
}

var filnum;

var palette;                                  // palette: integer regarding the selected varying color palette
var colArray;                                 // colArray: array containing 1536 colors in sequential order
                                              // ..mixing up to 2 colors at a time. 
var draw;                                     // draw: whether its drawing or not
var dir;                                      // dir: determines direction of varying size (bigger/smaller)
var sym,vars,rot,bor,fill,fade;               // booleans regarding the checkboxes
                                              // sym: symmetry / vars: variable size / rot: rotating brush
                                              // bor: connected borders / fill: brush filling / fade: drawing fades
var rotnum,thick,bSize,bSizeTemp;             // integers regarding the number input
                                              // rotnum: number of rotations / thick: brush thickhickness
                                              // bSize: brush size / bSizeTemp: a temporal to know original size
var r,g,b;                                    // r,g,b: integers regarding the color sliders
var alphaValue;                               // alphaValue: decimal regarding the brush transparency
var place;                                    // place: integer regarding the place of the multicolor array in case
                                              // a different palette is selected
var x1,x2,y1,y2,aX,aY;                        // several integers regarding coordinates of line start and line end
                                              // x2,y2: previous pointer position
                                              // x1,y1: actual pointer position
                                              // aX,yX: auxiliary copy of actual position forstuff
var x1rot,y1rot,x2rot,y2rot;                  // numbers regarding a rotation of the line coordinates
var brush;                                    // brush: integer regarding the selected brush
var rotable,variable,connectable;             // several booleans regarding brush properties
                                              // rotable: whether a brush can rotate over itself
                                              // variable: whether a brush size can vary within a range
                                              // connectable: whether a brush's vertices can be connected
var angle, brushRotD, brushRotR;              // several numbers used forseveral calculus
                                              // angle: the angle obtained from the number of desired rotations
                                              // brushRotD: the angle in degrees of a brush rotating on itself
                                              // brushRotR: the angle in radians of a brush rotating on itself
var posX,posY,preX,preY;                      // several arrays forstoring previous and current coordinates
                                              // .. for shape drawing purposes

var fadeCount; // counter for the fading
var triDir;    // direction of the triangle for the alternating triangle fillings
var stage;     // variable for storing in Craze Mode the alternating line and circle drawings

//Values for Switch/Case regarding the selected Brush
var REGULAR_LINE     = 1;
var LINES_FROM_START = 2;
var VERTICAL_LINES   = 3;
var HORIZONTAL_LINES = 4;
var GREAT_CROSS      = 5;
var TRIANGLES        = 6;
var SQUARES          = 7;
var CIRCLES          = 8;
var CHAIN            = 9;

//Values for different varying color palettes
var NORMAL    = 1;
var RAINBOWS  = 2;
var FIRE      = 3;
var ICE       = 4;
var NATURE    = 5;
var MYSTIC    = 6;
var BOREALIS  = 7;
var GRAYSCALE = 8;
var FOXES     = 9;

function modifier() {
// On each 'step' we want to apply whatever modifiers are available
// The modifiers can be in color palettes (when these are shifting),
// brushes that may vary on size or rotation, and probably the fading
// of images, all of this occurring every step (every mouse move).
    colorShifter();
    varySize();
    varyRotation();
    fadeDrawing(true);
}

function liner() {
// To draw and rotate lines or circles around the center.
    var cenX = canvas.getCenter().x;
    var cenY = canvas.getCenter().y;
    x1rot = x1 - cenX;
    y1rot = y1 - cenY;
    x2rot = x2 - cenX;
    y2rot = y2 - cenY;
    // Translate the dots to the corner of the screen, since in computer drawing, the
    // real 'origin' coordinates is at the left-uppermost part of the screen.
    rotateLine();
    // this is the cycle that rotates a line n times, including drawing the first one
    // the magic is at this formula obtained from applying trigonometrical identities:
    // x' = x * cos(angle) - y * sin(angle)
    // y' = x * sin(angle) + y * cos(angle)
    // and at every iteration the x'/y' are copied to x/y so it allows subsequential
    // rotations. angle is obtained from dividing 360 with rotnum (number of rotations)
    // and then converting to radians. 
    for(var i = 0; i < rotnum; ++i){
        x1new = x1rot * Math.cos(angle) - y1rot * Math.sin(angle);
        y1new = x1rot * Math.sin(angle) + y1rot * Math.cos(angle);
        // Beginning Coordinate was rotated.
        x2new = x2rot * Math.cos(angle) - y2rot * Math.sin(angle);
        y2new = x2rot * Math.sin(angle) + y2rot * Math.cos(angle);
        // Ending Coordinate was rotated.
        x1rot = x1new;
        y1rot = y1new;
        x2rot = x2new;
        y2rot = y2new;
        // Current coordinates were transferred to the old.
        drawr(x2new + cenX, y2new + cenY, x1new + cenX, y1new + cenY, false);
        // re-add the substracted center position to the rotated coordinates
        if(connectable || fill){
        // If the current shape is to be filled, or we want the points to be co
        // nnected, we want to store the coordinates, for later drawing/filling.
            store(x2new + cenX, y2new + cenY, x1new + cenX, y1new + cenY);
        }
    }
}

function rotateLine() {
// Rotate a line around its own center with the 'Rotating Brush' parameter. 
    var cenX = canvas.getCenter().x;
    var cenY = canvas.getCenter().y;
    if(rot && rotable){
        brushRotR = brushRotD * Math.PI / 180;
        x1rot = x1 - aX;
        y1rot = y1 - aY;
        y2rot = y2 - aY;
        x2rot = x2 - aX;
        x1new = x1rot * Math.cos(brushRotR) - y1rot * Math.sin(brushRotR);
        y1new = x1rot * Math.sin(brushRotR) + y1rot * Math.cos(brushRotR);
        x2new = x2rot * Math.cos(brushRotR) - y2rot * Math.sin(brushRotR);
        y2new = x2rot * Math.sin(brushRotR) + y2rot * Math.cos(brushRotR);
        x1rot = x1new + aX - cenX;
        y1rot = y1new + aY - cenY;
        x2rot = x2new + aX - cenX;
        y2rot = y2new + aY - cenY;
    }
}

function varyRotation() { 
// Vary the rotating angle of a brush with the Rotating Brush parameter.
    if(rot == true){
        brushRotD++;
        brushRotD %= 359;
    }
}

function fadeDrawing(user) {
// Make the drawing 'fade' with the 'Fading Image' parameter. This is not shared
// between clients, if someone has its drawing fading, the other person's drawing
// will not fade unless that person also has the parameter set.
    fadeCount++;
    if(fadeCount > 30 * (!user? 20 : 1)) {
    // This is because the user will call the fading function only once for all the
    // rotations, and segments of shapes, whereas the fading function will be called
    // for each segment of another user's drawings, so the threshold in which the
    // fading function should not be called is significantly larger for other users'
    // incoming drawing commands.
        if(fade == true){
            var ctx = canvas.getContext();
            var imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
            var datas = imageData.data;
            var len = datas.length;
            for(var i = 0; i < len; i += 4){
                datas[i]   *= 0.9;
                datas[i+1] *= 0.9;
                datas[i+2] *= 0.9;
            }
            ctx.putImageData(imageData, 0, 0);
            fadeCount = 0;
        }
    }
}

function varySize() { 
// Vary the size of a brush with the 'Variable Size' parameter. This is a varia-
// tion that ranges between 1/2 of the brush size, and 3/2s of it.
    if(vars == true){
        if(bSize < 3 * bSizeTemp / 2 && dir == true){ bSize++; }
        else{
            if(dir == true){ dir = false; }
        }
        if(bSize > bSizeTemp / 2  && dir == false){ bSize--; }
        else{
            if(dir == false){ dir = true; }
        }
    }
}

function drawr(xi, yi, xf, yf, connect) {
// This function will have the current point and the previous point,
// depending on what brush is enabled, this will draw it either by
// using lines or circles, the basic components of all brushes.
    var cenX = canvas.getCenter().x;
    var cenY = canvas.getCenter().y;
    if((brush != CIRCLES && brush != CHAIN) || connect == true) {
        drawLine(xi, yi, xf, yf, fill, true, cenX, cenY);
        if (sym) {
            drawLine(2 * cenX - xf, yf, 2 * cenX - xi, yi, fill, true, cenX, cenY);
        }
    } 
    if(brush == CIRCLES || brush == CHAIN) {
        var xx = (xi + xf) / 2;
        var yy = (yi + yf) / 2;
        var radius;
        if(brush == CIRCLES) {
            radius = bSize / 2;
        }
        if(brush == CHAIN) {
            var dx = xi - xf;
            var dy = yi - yf;
            radius = Math.sqrt(dx * dx + dy * dy) / 2;
        }
        drawCircle(xx, yy, radius, fill, true, cenX, cenY);
        if(sym) {
            drawCircle(2 * cenX - xx, yy, radius, fill, true, cenX, cenY);
        }
    }
}

function drawOther(message) {
// This function is called when a message from the server is received,
// which is regarding drawing in the canvas some stuff that other user
// in the same room had drawn in their canvas.
    fadeDrawing(false);
    var ctx = canvas.getContext();
    var bakColor = canvas.getStrokeColor();
    canvas.setStrokeColor(message.color);
    if(message.type == "line") {
        var xi, yi, xf, yf, fill;
        xi = message.xi;
        yi = message.yi;
        xf = message.xf;
        yf = message.yf;
        fill = message.fill;
        drawLine(xi, yi, xf, yf, fill, false, message.oldcenX, message.oldcenY);
    }
    if(message.type == "circle") {
        var x, y, r, fill;
        x = message.x;
        y = message.y;
        r = message.r;
        fill = message.fill,
        drawCircle(x, y, r, fill, false, message.oldcenX, message.oldcenY);
    }
    if(message.type == "fill") {
        var fillnum, symm, posX, posY, fill, rotnum, oldcenX, oldcenY;
        fillnum = message.fillnum;
        symm = message.symm;
        posX = message.posX;
        posY = message.posY;
        fill = message.fill;
        rotnum = message.rotnum;
        oldcenX = message.oldcenX;
        oldcenY = message.oldcenY;
        filler(fillnum, symm, posX, posY, fill, rotnum, false, oldcenX, oldcenY);
    }
    canvas.setStrokeColor(bakColor);
}

function drawLine(xi, yi, xf, yf, fill, user, oldcenX, oldcenY) {
// Draw a line from a starting to an ending point.
    xi = xi - oldcenX + canvas.getCenter().x;
    xf = xf - oldcenX + canvas.getCenter().x;
    yi = yi - oldcenY + canvas.getCenter().y;
    yf = yf - oldcenY + canvas.getCenter().y;
    var ctx = canvas.getContext();
    ctx.shadowBlur = fill? 0 : 2;
    ctx.shadowColor = canvas.getStrokeColor();
    ctx.beginPath();
    ctx.moveTo(xi,yi);
    ctx.lineTo(xf,yf);
    ctx.stroke();
    ctx.closePath();
    if(user == true) {
    // To check if this line was drawn by the user. If its a line from
    // another user, don't send it to the server, because it could create
    // an infinite loop from which it sends stuff back and forth.
        var JSON = {
            type: "line",
            xi: xi,
            yi: yi,
            xf: xf,
            yf: yf,
            oldcenX: canvas.getCenter().x,
            oldcenY: canvas.getCenter().y,
            fill: fill,
            color: canvas.getStrokeColor()
        }
        socket.emit('message', JSON);    
    }
}

function drawCircle(x, y, r, fill, user, oldcenX, oldcenY) {
// Draw a line with the center coordinates, and its radius.
    x = x - oldcenX + canvas.getCenter().x;
    y = y - oldcenY + canvas.getCenter().y;
    var ctx = canvas.getContext();
    ctx.shadowBlur = fill? 0 : 2;
    ctx.shadowColor = canvas.getStrokeColor();
    ctx.beginPath();
    ctx.arc(x ,y , r , 0, 2 * Math.PI, false);
    ctx.closePath();
    if(fill){
        var fillbak = ctx.fillStyle;
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();
        ctx.fillStyle = fillbak;
    }
    else{
        ctx.stroke();
    }
    if(user == true) {
    // To check if this circle was drawn by the user. If its a line from
    // another user, don't send it to the server, because it could create
    // an infinite loop from which it sends stuff back and forth.
        var JSON = {
            type: "circle",
            x: x,
            y: y,
            r: r,
            oldcenX: canvas.getCenter().x,
            oldcenY: canvas.getCenter().y,
            fill: fill,
            color: canvas.getStrokeColor()
        }
        socket.emit('message', JSON);
    }
}

function store(mx2, my2, mx1, my1) {
// Store pairs of coordinates, for connecting with the previous points
// in case such parameter is enabled, or to draw whole shapes.
    posX.push(mx1);
    posY.push(my1);
    posX.push(mx2);
    posY.push(my2);
}

function filler(fillnum, symm, posX, posY, fill, rotnum, user, oldcenX, oldcenY) {
// To fill shapes in case it is needed
    if(fill == true) {
        var filX = [];
        var filY = [];
        for(var i = 0; i < posX.length; ++i) {
            if(symm) {
                filX.push((2 * oldcenX - posX[i]) - oldcenX + canvas.getCenter().x);
            }
            else {
                filX.push(posX[i] - oldcenX + canvas.getCenter().x);
            }
            filY.push(posY[i] - oldcenY + canvas.getCenter().y);
        }
        var ctx = canvas.getContext('2d');
        var fillbak = ctx.fillStyle;
        ctx.fillStyle = ctx.strokeStyle;
        for(var j = 0; j < rotnum; j++) {
            ctx.beginPath();
            var f = 0;
            for(var i = j * 2; f < fillnum; i += rotnum * 2) {
                ctx.lineTo(filX[i], filY[i]);
                ctx.lineTo(filX[i + 1], filY[i + 1]);
                f++;
            }
            ctx.closePath();
            ctx.fill();
        }
        ctx.fillStyle = fillbak;
        if(symm) {
            filler(fillnum, false, posX, posY, fill, rotnum, user, oldcenX, oldcenY);
        }
        if(user == true) {
            var JSON = {
                type: "fill",
                fillnum: fillnum,
                symm: symm,
                posX: posX,
                posY: posY,
                fill: fill,
                oldcenX: canvas.getCenter().x,
                oldcenY: canvas.getCenter().y,
                rotnum: rotnum,
                color: canvas.getStrokeColor()
            }
            socket.emit('message', JSON);
        }
    }
}

function connecter() {
// To connect the current points with the previous ones in shapes.
    if(bor == true){
    // Draw lines between the previous and the current coordinates if
    // the 'Connect Borders' parameter is enabled.
        for(var i = 0; i < preX.length; ++i){
            drawr(preX[i], preY[i], posX[i], posY[i], true);
        }
    }
    preX = [];
    preY = [];
    // Empty the lists of previous coordinates.
    for(var i = 0; i < posX.length; ++i){
    // Push the current coordinates into the list of old coordinates.
        preX.push(posX[i]);
        preY.push(posY[i]);
    }
    posX = [];
    posY = [];
    // Empty the lists of current coordinates.
}

function bresenhamLine(xa, ya, xb, yb) {
// Bresenham Line Algorithm
    var x1 = xa;
    var x2 = xb;
    var y1 = ya;
    var y2 = yb;
    var result = [];
    var m;
    var dy = (y2 - y1);
    var dx = (x2 - x1);
    if (x1 == x2) {
        var INF = 2142;
        m = INF;
    } else {
        m = dy / dx;
    }
    var dir = (m < 0) ? -1 : 1;
    dy = Math.abs(dy);
    dx = Math.abs(dx);
    if (Math.abs(m) > 1) {
        var temp = dx;
        dx = dy;
        dy = temp;
        temp = x1;
        x1 = y1;
        y1 = temp;
        temp = x2;
        x2 = y2;
        y2 = temp;
    }
    if (x2 < x1) {
        var temp = x2;
        x2 = x1;
        x1 = temp;
        temp = y2;
        y2 = y1;
        y1 = temp;
    }
    var d = 2 * dy - dx;
    var incE = 2 * dy;
    var incNE = 2 * dy - 2 * dx;
    while (dx > 0) {
        if (d <= 0) {
            d += incE;
        } else {
            d += incNE;
            y1 += dir;
        }
        if (Math.abs(m) > 1) {
            result.push(new Point(y1, x1));
        } else {
            result.push(new Point(x1, y1));
        }
        dx--;
        x1++;
    }
    return result;
}

function bresenhamCircle(xa, ya, xb, yb) {
// Bresenham Circle Algorithm.
    var x1 = xa;
    var x2 = xb;
    var y1 = ya;
    var y2 = yb;
    var dx = x2 - x1;
    var dy = y2 - y1;
    var rad = Math.sqrt(dx * dx + dy * dy);
    var x = 0;
    var y = Math.floor(Math.round(rad));
    var o1 = [];
    var o2 = [];
    var o3 = [];
    var o4 = [];
    var o5 = [];
    var o6 = [];
    var o7 = [];
    var o8 = [];
    var d = 3 - (2 * rad);
    while (x <= y) {
        o1.push(new Point(x + x2, y + y2));
        o2.push(new Point(y + x2, x + y2));
        o3.push(new Point(y + x2, -x + y2));
        o4.push(new Point(x + x2, -y + y2));
        o5.push(new Point(-x + x2, -y + y2));
        o6.push(new Point(-y + x2, -x + y2));
        o7.push(new Point(-y + x2, x + y2));
        o8.push(new Point(-x + x2, y + y2));
        if (d < 0) {
            d += 4 * x + 6;
        } else {
            d += 4 * (x - y) + 10;
            y--;
        }
        x++;
    }
    var result = [];
    for (var i = 0; i < o1.length; ++i) {
        result.push(o1[i]);
    }
    for (var i = o2.length - 1; i >= 0; --i) {
        result.push(o2[i]);
    }
    for (var i = 0; i < o3.length; ++i) {
        result.push(o3[i]);
    }
    for (var i = o4.length - 1; i >= 0; --i) {
        result.push(o4[i]);
    }
    for (var i = 0; i < o5.length; ++i) {
        result.push(o5[i]);
    }
    for (var i = o6.length - 1; i >= 0; --i) {
        result.push(o6[i]);
    }
    for (var i = 0; i < o7.length; ++i) {
        result.push(o7[i]);
    }
    for (var i = o8.length - 1; i >= 0; --i) {
        result.push(o8[i]);
    }
    return result;
}

function doMouseDown(event) {
    x2 = x1 = event.pageX;
    y2 = y1 = event.pageY;
    bSize = bSizeTemp;
    brushRotD = 0;
    dir = true;
    draw = true;
    posX = [];
    posY = [];
    preX = [];
    preY = [];
}

function doMouseUp(event) {
    draw = false;;
}

function doMouseMove(event) {
    if (draw) {
        modifier();
        // The original position of the mouse pointer is stored
        aX = x1 = event.pageX;
        aY = y1 = event.pageY;
        // It will then check which brush is currently selected
        switch (brush) {
            case REGULAR_LINE:
                liner();
                //setSeed(0,0,0,0) means that simply all of the x1,y1,x2,y2 will be set to aX and aY.
                // this is because at the end of each stroke, the current detected mouse position will
                // be transferred to the old one. when drawing a stroke, the computer doesn't really 
                // detect all the pixels where the mouse went through, it just detects a handful of points
                // so drawing a stroke is really about drawing lines between the detected points
                setSeed(0, 0, 0, 0);
                break;
            case LINES_FROM_START:
                connectable = true;
                // setSeed is not called because x2 and y2 will forever be the original mouse position
                // while x1 and y1 are usually modified at each detected mouse position, resulting in the
                // 'Lines from start' effect
                liner();
                connecter();
                break;
            case VERTICAL_LINES:
                // rotable: means that the brush can rotate on itself, or its center
                // variable: means that the brush size can vary within 3/2 and 1/2 of the desired size
                // connectable: means that the vertices of the brush can have connections between the current
                // stroke of the brush and the next one
                rotable = true;
                variable = true;
                connectable = true;
                // the line seed values are set at changed y positions, while x remains the same (a vertical line)
                fitToGrid();
                setSeed(1, 0, -1, 0);
                liner();
                connecter();
                break;
            case HORIZONTAL_LINES:
                rotable = true;
                variable = true;
                connectable = true;
                fitToGrid();
                // the line seed values are set at changed x positions, while y remains the same (a horizontal line)
                setSeed(0, 1, 0, -1);
                liner();
                connecter();
                break;
            case GREAT_CROSS:
                // this brush is really just a mix of both horizontal and vertical lines called in sequence
                rotable = true;
                variable = true;
                connectable = true;
                fitToGrid();
                setSeed(0, 1, 0, -1);
                liner();
                setSeed(1, 0, -1, 0);
                liner();
                connecter();
                break;
            case TRIANGLES:
                var t = Math.sqrt(4.0 / 3.0);
                variable = true;
                rotable = true;
                connectable = true;
                // a triangle is drawing three lines, so there are 3 coordinate changes (foreach line of a triagle side)
                // and a subsequent call to 'liner' to draw each of these lines
                fitToGrid();
                setSeed(-1 * triDir, 0 * triDir, 1 * triDir, -t * triDir);
                liner();
                setSeed(1 * triDir, -t * triDir, 1 * triDir, t * triDir);
                liner();
                setSeed(1 * triDir, t * triDir, -1 * triDir, 0 * triDir);
                liner();
                filler(3, sym, posX, posY, fill, rotnum, true, canvas.getCenter().x, canvas.getCenter().y);
                connecter();
                break;
            case SQUARES:
                // Squares are simply four lines
                variable = true;
                rotable = true;
                connectable = true;
                fitToGrid();
                // This puts the base coordinate at the center of the shape
                // Then each line will be adjusted.
                setSeed(-1, -1, -1, 1);
                liner();
                setSeed(-1, 1, 1, 1);
                liner();
                setSeed(1, 1, 1, -1);
                liner();
                setSeed(1, -1, -1, -1);
                liner();
                filler(4, sym, posX, posY, fill, rotnum, true, canvas.getCenter().x, canvas.getCenter().y);
                connecter();
                break;
            case CIRCLES:
                rotable = true;
                variable = true;
                connectable = true;
                fitToGrid();
                setSeed(0, 1, 0, -1);
                liner();
                setSeed(1, 0, -1, 0);
                liner();
                connecter();
                break;
            case CHAIN:
                rotable = true;
                variable = true;
                connectable = true;
                liner();
                setSeed(0, 0, 0, 0);
                break;
        }
        rotable = false;
        variable = false;
        connectable = false;
    }
}

function setSeed(h1, w1, h2, w2){
// this function is forsetting a line beginning and end coordinates
// starting from aX/aY which are auxiliary copies of the beginning
// mouse pointer position. the whole program is about drawing lines
    y1 = aY + h1*bSize/2;
    x1 = aX + w1*bSize/2;
    y2 = aY + h2*bSize/2;
    x2 = aX + w2*bSize/2;
}

var Point = function(px, py) {
// Create a point
    var x = px;
    var y = py;
    this.x = function() {
        return x;
    }
    this.y = function() {
        return y;
    }
}

function rainbowPalette(){
  var rr, gg, bb;
  rr = 255, gg = 0, bb = 0;
  colArray = new Array(1536);
  place = 0;
  for(var i = 0; i < 1536; ++i) {
    if(rr == 255 && gg != 255 && bb == 0  ){ gg++; }
    if(rr != 0   && gg == 255 && bb == 0  ){ rr--; }
    if(rr == 0   && gg == 255 && bb != 255){ bb++; }
    if(rr == 0   && gg != 0   && bb == 255){ gg--; }
    if(rr != 255 && gg == 0   && bb == 255){ rr++; }
    if(rr == 255 && gg == 0   && bb != 0  ){ bb--; }
    colArray[i] = "rgba("+ rr + "," + gg + "," + bb + ",";
  }
}

function foxesPalette(){
  var rr, gg, bb;
  rr = 127, gg = 0, bb = 255;
  colArray = new Array(1280);
  place = 0;
  for(var i = 0; i < 1280; ++i) {
    if(i < 128){
      rr++;
    }
    else if(i < 640){
      if(rr == 255 && gg == 0   && bb != 0  ){ bb--; }
      if(rr == 255 && gg != 255 && bb == 0  ){ gg++; }
    }
    else if(i < 1152){
      if(rr == 255 && gg == 0   && bb != 255){ bb++; }
      if(rr == 255 && gg != 0   && bb == 0  ){ gg--; }
    }
    else{
      rr--;
    }
    colArray[i] = "rgba("+ rr + "," + gg + "," + bb + ",";
  }
}

function firePalette(){
  var rr, gg, bb;
  rr = 255, gg = 0, bb = 0;
  colArray = new Array(512);
  place = 0;
  for(var i = 0; i < 512; ++i) {
    if(i <  255){ gg++; }
    if(i >= 255){ gg--; }
    colArray[i] = "rgba("+ rr + "," + gg + "," + bb + ",";
  }
}

function icePalette(){
  var rr, gg, bb;
  rr = 0, gg = 0, bb = 255;
  colArray = new Array(1024);
  place = 0;
  for(var i = 0; i < 1024; ++i) {
    if(i <  255){ gg++; }
    else if(i <  512){ rr++; }
    else if(i <  768){ rr--; }
    else if(i <  1024){ gg--; }

    colArray[i] = "rgba("+ rr + "," + gg + "," + bb + ",";
  }
}

function naturePalette(){
  var rr, gg, bb;
  rr = 0, gg = 255, bb = 128;
  colArray = new Array(256);
  place = 0;
  for(var i = 0; i < 256; ++i) {
    if(i < 64){ gg--;}
    else{ 
      if(i < 128){ gg++; }
      else{
        if(i < 192){ gg--; }
        else{ gg++; }
      }
    }
    if(i <  128){ rr++; bb--;}
    if(i >= 128){ rr--; bb++;}
    colArray[i] = "rgba("+ rr + "," + gg + "," + bb + ",";
  }
}

function mysticPalette(){
  var rr, gg, bb;
  rr = 255, gg = 0, bb = 128;
  colArray = new Array(512);
  place = 0;
  for(var i = 0; i < 512; ++i) {
   if(i < 128){ bb++;}
    else{ 
      if(i < 256){ bb--; }
      else{
        if(i < 384){ bb++; }
        else{ bb--; }
      }
    }
    if(i <  255){ rr--;
      if(i < 128){ gg++;} else{ gg--; }
    }
    if(i >= 255){ rr++; 
      if(i < 384){ gg++;} else{ gg--; }
    }
    colArray[i] = "rgba("+ rr + "," + gg + "," + bb + ",";
  }
}

function borealisPalette(){
  var rr, gg, bb;
  rr = 0, gg = 255, bb = 0;
  colArray = new Array(1024);
  place = 0;
  for(var i = 0; i < 1024; ++i) {
    if(i <  255){ bb++; }
    else{
      if(i <  512){ gg--; rr++; }
      else{
        if(i < 768){ gg++; rr--; }
        else{
          bb--;
        }
      }
    }
    colArray[i] = "rgba("+ rr + "," + gg + "," + bb + ",";
  }
}

function grayscalePalette(){
  var rr, gg, bb;
  rr = 255, gg = 255, bb = 255;
  colArray = new Array(512);
  place = 0;
  for(var i = 0; i < 512; ++i) {
    if(i <  255){ rr--; gg--; bb--; }
    if(i >= 255){ rr++; gg++; bb++; }
    colArray[i] = "rgba("+ rr + "," + gg + "," + bb + ",";
  }
}

function insideTriangle(cX, cY) {
// Detection of a point being inside a polygon
    var paX, paY, pbX, pbY, pcX, pcY;
    paX = aX;
    paY = aY - bSize / 2;
    pbX = aX - Math.sqrt(4.0 / 3.0) * bSize / 2;
    pbY = aY + bSize / 2;
    pcX = aX + Math.sqrt(4.0 / 3.0) * bSize / 2;
    pcY = aY + bSize / 2;
    var cp1, cp2, cp3;
    cp1 = (pbX - paX) * (cY - paY) - (pbY - paY) * (cX - paX);
    cp2 = (pcX - pbX) * (cY - pbY) - (pcY - pbY) * (cX - pbX);
    cp3 = (paX - pcX) * (cY - pcY) - (paY - pcY) * (cX - pcX);
    return cp1 * cp2 >= 0 && cp2 * cp3 >= 0 && cp3 * cp1 >= 0;
}

function insideReverseTriangle(cX, cY) {
// Detection of a point being inside a polygon
    var paX, paY, pbX, pbY, pcX, pcY;
    paX = aX;
    paY = aY + bSize / 2;
    pbX = aX + Math.sqrt(4.0 / 3.0) * bSize / 2;
    pbY = aY - bSize / 2;
    pcX = aX - Math.sqrt(4.0 / 3.0) * bSize / 2;
    pcY = aY - bSize / 2;
    var cp1, cp2, cp3;
    cp1 = (pbX - paX) * (cY - paY) - (pbY - paY) * (cX - paX);
    cp2 = (pcX - pbX) * (cY - pbY) - (pcY - pbY) * (cX - pbX);
    cp3 = (paX - pcX) * (cY - pcY) - (paY - pcY) * (cX - pcX);
    return cp1 * cp2 >= 0 && cp2 * cp3 >= 0 && cp3 * cp1 >= 0;
}


function fitToGrid() {
// This puts the coordinates at a fixed grid.
    if(grid) {
        var pY = aY;
        // The current position in Y.
        var cY = canvas.height() / 2;
        // The vertical center of the canvas.
        var dY = pY - cY;
        // The vertical distance from the current point to the origin.
        var pX = aX;
        // The current position in X.
        var cX = canvas.width() / 2;
        // The horizontal center of the canvas.
        var dX = pX - cX;
        // The horizontal distance from the current point to the origin.
        var height = bSize;
        var base;
        // The base size of the shape.
        if(brush == TRIANGLES) {
            base = height * Math.sqrt(4.0 / 3.0);
            // For triangles, the brush size will determine the height,
            // so we'll determine the base size with a equilateral triangle
            // base in function of the height.
            // height^2 + base^2 / 4 = base^2
            // height^2 = 3/4 * base^2
            // height = sqrt(3/4) * base
            // base = height * sqrt(4/3) 
        }
        else {
            // The other possible shape, the square, will have a base with
            // the same length that the height.
            base = height;
        }
        aY = Math.floor(dY / height) * height + cY;
        // Set the shape vertical starting point to the closest lower multiple
        // of the height (kind of like a floor function with steps == height).
        aX = Math.floor(dX / base) * base + cX;
        // Set the shape horizontal starting point to the closest lower multiple
        // of the width (kind of like a floor function with steps == width).
        if (pY - aY > height / 2) {
        // If the current point is closer to the next step than the one before
        // it, then round to the next step. This is like a round function, in
        // the end, the starting point will be at the closest multiple of height.
            aY += height;
        }
        if (pX - aX > base / 2) {
        // If the current point is closer to the next step than the one before
        // it, then round to the next step. This is like a round function, in
        // the end, the starting point will be at the closest multiple of width.
            aX += base;
        }
        var heightMultiple = Math.abs((aY - cY) / height);
        if(heightMultiple % 2 == 0 && brush == TRIANGLES && !rot) {
        // For the alternating rows of triangles when fit to a grid
            if(!insideTriangle(pX, pY)) {
                triDir = -1;
                if(aX > pX) {
                    aX -= base / 2;
                }
                else {
                    aX += base / 2;
                }
            }
            else {
                triDir = 1;
            }
            return;
        } 
        if(heightMultiple % 2 == 1 && brush == TRIANGLES && !rot) {
        // For the alternating rows of triangles when fit to a grid
            if(!insideReverseTriangle(pX, pY)) {
                triDir = 1;
                if(aX > pX) {
                    aX -= base / 2;
                }
                else {
                    aX += base / 2;
                }
            }
            else {
                triDir = -1;
            }
            return;
        }
        triDir = 1;
        return;
    }
}

function colorShifter() {
// Shifting colors across a palette.
    if (palette > 1) {
        place += 5;
        place %= colArray.length;
        updateColor();
    }
}

function colorInitializer(paletteSelected) {
    // Initializing special palettes of shifting colors.
    switch (paletteSelected) {
        case RAINBOWS:
            rainbowPalette();
            break;
        case FIRE:
            firePalette();
            break;
        case ICE:
            icePalette();
            break;
        case NATURE:
            naturePalette();
            break;
        case MYSTIC:
            mysticPalette();
            break;
        case BOREALIS:
            borealisPalette();
            break;
        case GRAYSCALE:
            grayscalePalette();
            break;
        case FOXES:
            foxesPalette();
            break;
    }
}

function setSeed(h1, w1, h2, w2) {
// this function is forsetting a line beginning and end coordinates
// starting from aX/aY which are auxiliary copies of the beginning
// mouse pointer position. the whole program is about drawing lines
    y1 = aY + h1 * bSize / 2;
    x1 = aX + w1 * bSize / 2;
    y2 = aY + h2 * bSize / 2;
    x2 = aX + w2 * bSize / 2;
}

function colorChanged(sliderChanged, colorIndex) {
// When a color is changed either from the slider or the spinner.
    var c = colors[colorIndex];
    var sliderValue;
    var colorField = $("#" + c);
    var textField = $("#" + c + "txt");
    if (sliderChanged) {
        sliderValue = colorField.val();
        textField.val(sliderValue);
    } else {
        var newColor = textField.val();
        newColor = Math.min(255, newColor);
        newColor = Math.max(0, newColor);
        textField.val(newColor);
        colorField.val(newColor);
        sliderValue = newColor;
    }

    setColor(sliderValue, colorIndex);
    updateColor();
}

function alphaChanged(sliderChanged, colorIndex) {
// When the alpha channel (transparency) is changed from slider or spinner.
    var sliderValue;
    var alphaField = $("#alpha");
    var textField = $("#alphatxt");
    if (sliderChanged) {
        sliderValue = alphaField.val();
        textField.val(sliderValue);
    } else {
        var newAlpha = textField.val();
        newAlpha = Math.min(100, newAlpha);
        newAlpha = Math.max(0, newAlpha);
        textField.val(newAlpha);
        alphaField.val(newAlpha);
        sliderValue = newAlpha;
    }
    alphaValue = sliderValue / 100.0;
    updateColor();
}

function setColor(colorValue, colorIndex) {
// This function sets the color variable in the code to the value it was 
// changed to in the html, depending on a value and a index depending on
// the input that was changed
    switch (colorIndex) {
        case 0:
            r = colorValue;
            break;
        case 1:
            g = colorValue;
            break;
        case 2:
            b = colorValue;
            break;
    }
}

function updateColor() {
// This function updates the brush color depending if a different palette is in use or not.
// if its not, it just creates a color using the r,g,b variable values. if it is, it takes
// the color from colArray depending on the current changing position or 'place'. then the
// alpha value is applied.
    var color;
    if (palette == 1) {
        color = "rgba(" + r + "," + g + "," + b + ",";
        $("#coltxt").css("background-color", color + alphaValue + ")");
    } else {
        color = colArray[place];
    }
    canvas.setStrokeColor(color + alphaValue + ")");
    var ctx = canvas.getContext();
    ctx.shadowColor = color + alphaValue + ")";
}

function variableInitializer() {
// this function initializes variables pulling them from the original default value in the DOM
    craze = false;
    stage = true;
    alphaValue = 1;
    updatePalette();
    fadeCount = 0;
    fade = true;
    grid = false;
    triDir = 1;
    colorChanged(0, 0);
    colorChanged(0, 1);
    colorChanged(0, 2);
    updatePalette();
    updateSymmetry();
    updateVariable();
    updateRotating();
    updateConnect();
    updateRotNum();
    updateThick();
    updateBrush();
    updateSize();
    updateFill();
    updateFade();
}

function updateSymmetry() {
    sym = $("#symmetry").is(':checked');;
}

function updateVariable() {
    vars = $("#variable").is(':checked');;
}

function updateRotating() {
    rot = $("#rotating").is(':checked');;
}

function updateConnect() {
    bor = $("#connect").is(':checked');;
}

function updateFill() {
    fill = $("#fill").is(':checked');;
}

function updateFade() {
    fade = $("#fade").is(':checked');;
}

function updateGrid() {
    grid = $("#grid").is(':checked');;
}

function updateRotNum() {
    preX = [];
    preY = [];
    posX = [];
    posY = [];
    rotnum = $("#rota").val();
    rotnum = Math.max(rotnum, 1);
    rotnum = Math.min(rotnum, 360);
    $("#rota").val(rotnum);
    updateAngle();
}

function updateThick() {
    var ctx = canvas.getContext();
    ctx.lineWidth = $("#thick").val();
    ctx.lineWidth = Math.min(ctx.lineWidth, 7);
    ctx.lineWidth = Math.max(ctx.lineWidth, 1);
    $("#thick").val(ctx.lineWidth);
}

function updateSize() {
    bSize = $("#bsize").val();
    bSize = Math.min(1742, bSize);
    bSize = Math.max(1, bSize);
    $("#bsize").val(bSize);
    bSizeTemp = bSize;
}

function updatePalette() {
    palette = $("#paletteSelection").val();
    palette = parseInt(palette);
    colorInitializer(palette);
    updateColor();
}

function updateBrush() {
    brush = $("#brushSelection").val();
    brush = parseInt(brush);
}

function updateAngle() {
    angle = 2 * Math.PI / rotnum;;
}

function killCrazeMode() {
    intv = window.clearInterval(intv);
    craze = false;
    draw = false;
}

/*
  crazeMode:
  a function that makes the program paint chaotically
  
  [1]: if the mode is called by pressing the button, and its already running, its killed
       another way to kill it is to draw on the screen, which calls the killCrazeMode method
  [2]: a spoof mouse coordinate is created. it will be passed to mouse methods as if it were
       a true mouse event, having properties called the same (pageX, pageY). the beginning
       coordinate is the center of the screen
  [3]: a interval is created. its like a thread, that will call the crazeModeMove function 
       every 1 milliseconds, as defined in its creation
*/
function crazeMode() {
    //[1]
    if (craze) {
        killCrazeMode();
    } else {
        craze = true;
        //[2]
        intvPoint = new IntvCoord();
        intvPoint.pageX = canvas.getCenter().x;
        intvPoint.pageY = canvas.getCenter().y;
        doMouseDown(intvPoint);
        //[3]
        intv = self.setInterval(function() {
            crazeModeMove()
        }, 1);
    }
}

function crazeModeMove() {
    var dis = fade ? 20 : 11;
    if (!stage) {
        dis *= 3;
    }
    var dx = Math.floor(Math.random() * dis);
    var dy = Math.floor(Math.random() * dis);
    dx *= (Math.random() * 2) > 1 ? 1 : -1;
    dy *= (Math.random() * 2) > 1 ? 1 : -1;
    if (intvPoint.pageX + dx >= canvas.width() || intvPoint.pageX + dx <= 0) {
        dx *= -1;
    }
    if (intvPoint.pageY + dy >= canvas.height() || intvPoint.pageY + dy <= 0) {
        dy *= -1;
    }
    var x1 = intvPoint.pageX;
    var y1 = intvPoint.pageY;
    var points = stage ?
        bresenhamCircle(x1, y1, x1 + dx, y1 + dy) :
        bresenhamLine(x1, y1, x1 + dx, y1 + dy);
    var index = 0;
    var minn = 1000000;
    if (stage) {
        if (dx > 0) {
            for (var i = 0; i < points.length / 2; i++) {
                var n = points[i];
                var ddx = n.x() - x1;
                var ddy = n.y() - y1;
                var rad = Math.sqrt(ddx * ddx + ddy * ddy);
                if (rad < minn) {
                    index = i;
                    minn = rad;
                }
            }
        }
        else {
            for (var i = points.length - 1; i >= points.length / 2; i--) {
                var n = points[i];
                var ddx = n.x() - x1;
                var ddy = n.y() - y1;
                var rad = Math.sqrt(ddx * ddx + ddy * ddy);
                if (rad < minn) {
                    index = i;
                    minn = rad;
                }
            }
        }
    }
    else {
        index = x1 < x1 + dx ? 0 : points.length - 1;
    }
    for (var i = index; x1 < x1 + dx && i < points.length; i += 3) {
        var p = points[i];
        if (p.x() > canvas.width() || p.y() > canvas.height() || p.x() < 0 || p.y() < 0) break;
        intvPoint.pageX = p.x();
        intvPoint.pageY = p.y();
        doMouseMove(intvPoint);
        if (stage && i + 5 >= points.length) i = 0;
        if (stage && Math.floor((Math.random() * 20 + 1)) == 1) break;
    }
    for (var i = index; x1 > x1 + dx && i >= 0; i -= 3) {
        var p = points[i];
        if (p.x() > canvas.width() || p.y() > canvas.height() || p.x() < 0 || p.y() < 0) break;
        intvPoint.pageX = p.x();
        intvPoint.pageY = p.y();
        doMouseMove(intvPoint);
        if (stage && i - 5 < 0) i = points.length - 1;
        if (stage && Math.floor((Math.random() * 20 + 1)) == 1) break;
    }
    stage = !stage;
}