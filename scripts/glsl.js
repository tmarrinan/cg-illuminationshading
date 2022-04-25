//////////////////////////////////////////////////
// Public functions
//////////////////////////////////////////////////

function glslCreateShaderProgram(gl, vert_source, frag_source) {
    // Compile vetex shader
    let vertex_shader = glslCompileShader(gl, vert_source, gl.VERTEX_SHADER);
    // Compile fragment shader
    let fragment_shader = glslCompileShader(gl, frag_source, gl.FRAGMENT_SHADER);
    
    // Create GPU program from the compiled vertex and fragment shaders
    let shaders = [vertex_shader, fragment_shader];
    let program = glslAttachShaders(gl, shaders);
    
    return program;
}

function glslLinkShaderProgram(gl, program) {
    // Link GPU program
    gl.linkProgram(program);

    // Check to see if it linked successfully
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert('An error occurred linking the shader program.');
    }
}

function glslGetShaderProgramUniforms(gl, program) {
    // Get handles to uniform variables defined in the shaders
    let num_uniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    let uniforms = {};
    let i;
    for (i = 0; i < num_uniforms; i++) {
        let info = gl.getActiveUniform(program, i);
        uniforms[info.name] = gl.getUniformLocation(program, info.name);
    }
    
    return uniforms;
}

//////////////////////////////////////////////////
// Private functions
//////////////////////////////////////////////////

function glslCompileShader(gl, source, type) {
    // Create a shader object
    let shader = gl.createShader(type);

    // Send the source to the shader object
    gl.shaderSource(shader, source);

    // Compile the shader program
    gl.compileShader(shader);

    // Check to see if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(source);
        alert('An error occurred compiling the shader: ' + gl.getShaderInfoLog(shader));
    }

    return shader;
}

function glslAttachShaders(gl, shaders) {
    // Create a GPU program
    let program = gl.createProgram();

    // Attach all shaders to that program
    let i;
    for (i = 0; i < shaders.length; i++) {
        gl.attachShader(program, shaders[i]);
    }

    return program;
}