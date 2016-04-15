/*
    Generates points along a 3D bezier curve.
     
    Outputs should be connected to Queue patches to draw curve or points
    using Kineme GL Line Structure or GL Point Structure patches.
     
    //////////////
    // Controls //
    //////////////
     
    Draw:               Calculate point on curve
    CurveSteps:         Number of steps in curve segment
    CurveMaxLength:     Maximum XYZ distance between first and second anchor points
    CurveMaxTension:    Maximum XYZ distance between each anchor and its handle
    Scribbley:          Creates cursive looping scribbles
    ScribbleAmt:        Average size of scribble loops
    Jump:               Creates straight line segments by forcing recalculation
                        of curve points
    dummy:              Connect Patch Time to force JS to run every frame
     
    ///////////////
    // Copyright //
    ///////////////
     
    Please credit if using.
     
    toneburst 2009
    https://machinesdontcare.wordpress.com
*/
 
////////////////////////////
// Point Object & Methods //
////////////////////////////
 
// Declare custom object to hold point data
function point() { this.X = 0.1; this.Y = 0; this.Z = 0; }
 
// Set point to values from another point
point.prototype.settopoint = function(p) { this.X = p.X; this.Y = p.Y; this.Z = p.Z; }
 
// Object method for point (creates new random Anchor point as offset from last point)
point.prototype.newpointA = function(lastpoint, maxdist) {
    this.X = lastpoint.X + (Math.random() * (2 * maxdist) - maxdist);
    this.Y = lastpoint.Y + (Math.random() * (2 * maxdist) - maxdist);
    this.Z = lastpoint.Z + (Math.random() * (2 * maxdist) - maxdist);
}
 
// New handle point for smoother 's-curves' (based on handle at end of previous curve)
point.prototype.newpointH = function(lastanchor, lasthandle, tightness) {
    this.X = lastanchor.X + -lasthandle.X * tightness;
    this.Y = lastanchor.Y + -lasthandle.Y * tightness;
    this.Z = lastanchor.Z + -lasthandle.Z * tightness;
}
 
// Calculates point on bezier-curve, taking 4 variables of type point
// and 1 value for time (in 0 > 1 range)
point.prototype.bezierpoint = function(A, B, D, C, t) {
    var a = t; var b = 1 - t;
    this.X = A.X * Math.pow(b, 3) + 3 * B.X * Math.pow(b, 2) * a + 3 * C.X * b * Math.pow(a, 2) + D.X * Math.pow(a, 3);
    this.Y = A.Y * Math.pow(b, 3) + 3 * B.Y * Math.pow(b, 2) * a + 3 * C.Y * b * Math.pow(a, 2) + D.Y * Math.pow(a, 3);
    this.Z = A.Z * Math.pow(b, 3) + 3 * B.Z * Math.pow(b, 2) * a + 3 * C.Z * b * Math.pow(a, 2) + D.Z * Math.pow(a, 3);
}
 
////////////////////
// Init Variables //
////////////////////
 
// Point instances
var p0 = new point(); var p1 = new point(); var p2 = new point(); var p3 = new point(); var pbezier = new point();
// Objects to hold final values
var pout = new Object(); var anchors = new Object(); var handles = new Object();
var count = 0;      // Counter
var curveIncrement; // Variable to hold increment amount for each curve segment
 
///////////////////////
// Main Program Loop //
///////////////////////
 
function (__structure Point, __structure Anchors, __structure Handles)
            main
        (__boolean Draw, __index CurveSteps, __number CurveMaxLength, __number CurveMaxTension,
         __boolean Scribbley, __number ScribbleAmt, __boolean Jump,
         __number dummy)
{
 
    if(_testMode) {
     
    // Init points on first run
        p1.newpointA(p0, CurveMaxTension);
        p2.newpointA(p0, CurveMaxLength);
        p3.newpointA(p2, CurveMaxTension);  
     
    } else if(Draw) {
         
        ////////////////////
        // Scale Controls //
        ////////////////////
         
        CurveMaxLength = CurveMaxLength * 0.95 + 0.05;
        CurveMaxTension = CurveMaxLength * 0.95 + 0.05;
         
        ////////////////////////
        // Init Output Object //
        ////////////////////////
         
        var result = new Object();
         
        ///////////////////////////////
        // Reset Points if Necessary //
        ///////////////////////////////
         
        // IF count EQUALS CurveSteps OR Jump is TRUE, generate new points
        if(count == CurveSteps || Jump) {
         
        // Set curve points for next segment
            // Anchor 0 reset with position of p2 (Anchor 1)
            p0.settopoint(p2);
            // Handle 0: Discontinuous  or 'Loopy' curves
            if(!Scribbley) { p1.newpointA(p0, CurveMaxTension); } else { p1.newpointH(p2, p3, ScribbleAmt); }
            // Anchor 1
            p2.newpointA(p0, CurveMaxLength);
            // Handle 1
            p3.newpointA(p2, CurveMaxTension);
             
            // Curve step incremement
            curveIncrement = 1.0 / CurveSteps;
             
            // Set value for anchor and handle points
            anchors.X = p0.X; anchors.Y = p0.Y; anchors.Z = p0.Z;
            handles.X = p1.X; handles.Y = p1.Y; handles.Z = p1.Z;
            result.Anchors = anchors;   // Anchor-points for current segment
            result.Handles = handles;   // Handles for current segment
                 
            // Reset counter
            count = 0;
        }
 
        /////////////////////   
        // Calculate Point //
        /////////////////////
 
        // Current time (position of point along curve)
        var time = curveIncrement * count;
         
        // Calculate point on Bezier
        pbezier.bezierpoint(p0, p1, p2, p3, time);
         
        // Set object for point
        // Prevents extra unwanted object properties being output
        // (JS bug? May be fixed in future WebKit version)
        pout.X = pbezier.X; pout.Y = pbezier.Y; pout.Z = pbezier.Z;
         
        if (count == Math.floor(0.5 * CurveSteps)) {
        // IF curve half-drawn, output second anchor and handle points
            anchors.X = p2.X; anchors.Y = p2.Y; anchors.Z = p2.Z;
            handles.X = p3.X; handles.Y = p3.Y; handles.Z = p3.Z;
            result.Anchors = anchors;   // Anchor-points for current segment
            result.Handles = handles;   // Handles for current segment
        }
                 
        // Increment counter
        count++;
         
        /////////////////
        // Set Outputs //
        /////////////////
     
        // Set output point objects
        result.Point = pout;        // Bezier point along current segment
             
        // Output point
        return result;
    }
}