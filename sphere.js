
let buffers = [];
let canvas = {};
let gl = {};

function init() 
{
    canvas = document.querySelector("#c3d");
  
    // Initialize the GL context
    gl = canvas.getContext("webgl");

    // Only continue if WebGL is available and working
    if (!gl)
    {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Vertex shader program

    const vsSource = 
    `
        attribute vec4 aVertexPosition;
        attribute vec4 aVertexColor;

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        varying lowp vec4 vColor;

        void main(void) 
        {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            vColor = aVertexColor;
        }
    `;

    // Fragment shader program

    const fsSource = 
        `
        varying lowp vec4 vColor;

        void main(void) {
            gl_FragColor = vColor;
        }
    `;

    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    // Collect all the info needed to use the shader program.
    // Look up which attributes our shader program is using
    // for aVertexPosition, aVevrtexColor and also
    // look up uniform locations.
    const programInfo = 
    {
        program: shaderProgram,
        attribLocations: 
        {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        uniformLocations: 
        {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        },
    };
    
    // get buffers
    for (let i = 0; i < sphereArray.length; i+=4)
    {
        buffers.push(initBuffers(gl, sphereArray[i], sphereArray[i + 1], sphereArray[i + 2], sphereArray[i + 3], i));
    }
    
    const vertexCount = 600;
    
    // Draw the scene repeatedly
    function render() 
    {
        drawScene(gl, programInfo, buffers, vertexCount);
        requestAnimationFrame(render);
    }
    
    requestAnimationFrame(render);
    
    // interaction
    window.addEventListener("keydown", handleKeyDown);
    //window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousemove", handleMouseMove);
}

let shiftKey = 16;
let ctrlKey = 17;
let altKey = 18;

let xKey = 88;
let yKey = 89;
let zKey = 90;

var rSphere = 0;
var axisX = 0.0;
var axisY = 0.0;
var axisZ = 1.0;

let mouseInit = false;
var mouseX = 0;

// handle <Alt>, <Ctrl>, <Shift>
function handleKeyDown(event) 
{
    // reset rotations axes

    // specify need to reinit
    mouseInit = false;
    // get current mouse position
    //let bb = canvas.getBoundingClientRect();
    //mouseX = event.clientX - bb.left;
    
    switch (event.keyCode) 
    {
        case xKey:
            // X
            axisX = 1.0;
            axisY = 0.0;
            axisZ = 0.0;
            break;
        case yKey:
            // Y
            axisY = 1.0;
            axisX = 0.0;
            axisZ = 0.0;
            break;
        case zKey:
            // Z
            axisZ = 1.0;
            axisX = 0.0;
            axisY = 0.0;
            break;
    }
}

function handleKeyUp(event) 
{
    switch (event.keyCode) 
    {
        case shiftKey:
            // X
//            axisX = 0.0;
            break;
        case ctrlKey:
            // Y
//            axisY = 0.0;
            break;
        case altKey:
            // Z
//            axisZ = 0.0;
            break;
    }
}

function handleMouseMove(event) 
{
    let bb = canvas.getBoundingClientRect();
    let mouseXNew = event.clientX - bb.left;

    if (!mouseInit)
    {
        mouseInit = true;
        mouseX = mouseXNew;
        rSphere = 0;
    }
    else
    {
        rSphere += (mouseXNew - mouseX) / 100.0;
//        rSphere = event.movementX / 10.0;
    }
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
function initBuffers(gl, offsetx, offsety, offsetz, radius, id)
{
    // Create a buffer for the cube's vertex positions.
    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var latitudeBands = 10;
    var longitudeBands = 10;
    const position = [];

    for (var latNumber=0; latNumber <= latitudeBands; latNumber++) 
    {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);
    
        for (var longNumber=0; longNumber <= longitudeBands; longNumber++) 
        {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = (radius * cosPhi * sinTheta) + offsetx;
            var y = (radius * cosTheta) + offsety;
            var z = (radius * sinPhi * sinTheta) + offsetz;

            position.push(x);
            position.push(y);
            position.push(z);
        }
    }

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);

    // Now set up the colors for the faces. We'll use solid colors
    // for each face.
    const faceColors = 
        [
            [1.0, 0.0, 0.0, 1.0],
            [0.75, 0.0, 0.0, 1.0],
            [0.5, 0.0, 0.0, 1.0],
            [0.0, 1.0, 0.0, 1.0],
            [0.0, 0.75, 0.0, 1.0],
            [0.0, 0.5, 0.0, 1.0],
            [0.0, 0.0, 1.0, 1.0],
            [0.0, 0.0, 0.75, 1.0],
            [0.0, 0.0, 0.5, 1.0],
            [1.0, 1.0, 0.3, 1.0],
            [0.75, 0.75, 0.2, 1.0],
            [0.5, 0.5, 0.1, 1.0],
            [0.3, 1.0, 1.0, 1.0],
            [0.2, 0.75, 0.75, 1.0],
            [0.1, 0.5, 0.5, 1.0],
            [1.0, 0.3, 1.0, 1.0],
            [0.75, 0.2, 0.75, 1.0],
            [0.5, 0.1, 0.5, 1.0],
            [0.7, 0.7, 0.7, 1.0]
            [0.6, 0.6, 0.6, 1.0]
            [0.5, 0.5, 0.5, 1.0]
        ];
    
    // Convert the array of colors into a table for all the vertices.
    var colors = [];
    
    // rotate colors
//    let numPerSphere = position.length / 3;
//    let colorNum = 3 * id % faceColors.length;
    let numPerSphere = position.length;
    let colorNum = 3 * id % faceColors.length;
    
//    {
//        for (let i = colorNum; i < colorNum + 3; i++)
        for (var j=0; j < numPerSphere; j++) 
        {
            var color = faceColors[colorNum];
            colors = colors.concat(color);
        }
//    }

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    // Build the element array buffer; this specifies the indices
    // into the vertex arrays for each face's vertices.
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    const indices = [];
    
    for (var latNumber2=0; latNumber2 < latitudeBands; latNumber2++) 
    {
        for (var longNumber2=0; longNumber2 < longitudeBands; longNumber2++) 
        {
            var first = (latNumber2 * (longitudeBands + 1)) + longNumber2;
            var second = first + longitudeBands + 1;
            indices.push(first);
            indices.push(second);
            indices.push(first + 1);

            indices.push(second);
            indices.push(second + 1);
            indices.push(first + 1);
        }
    }

    // Now send the element array to GL
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {position: positionBuffer, color: colorBuffer, indices: indexBuffer};
}

//function drawScene(programInfo) 
function drawScene(gl, programInfo, buffers, vertexCount)
{
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
//    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fieldOfView = Math.PI / 2;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 500.0;
    const projectionMatrix = mat4.create();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();

    mat4.identity(modelViewMatrix);

    mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -250.0]);

    mat4.rotate(modelViewMatrix, modelViewMatrix, rSphere * Math.PI / 180, [axisX, axisY, axisZ]);
    
    for (let i = 0; i < buffers.length; i++)
    {
        let numPosComponents = 3;
        let ftype = gl.FLOAT;
        let normalize = false;
        let stride = 0;
        let offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i].position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numPosComponents,
            ftype,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);

    // Tell WebGL how to pull out the colors from the color buffer
    // into the vertexColor attribute.
        numColComponents = 4;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i].color);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numColComponents,
            ftype,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexColor);

        // Tell WebGL which indices to use to index the vertices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers[i].indices);

        // Tell WebGL to use our program when drawing
        gl.useProgram(programInfo.program);

        // Set the shader uniforms
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix);
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix);

            let ttype = gl.UNSIGNED_SHORT;
            gl.drawElements(gl.TRIANGLES, vertexCount, ttype, offset);
    }
}

function initShaderProgram(gl, vsSource, fsSource) 
{
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) 
    {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) 
{
    const shader = gl.createShader(type);

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
    {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

window.onload = init;

