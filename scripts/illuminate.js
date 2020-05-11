class GlApp {
    constructor(canvas_id, width, height, scene) {
        // initialize <canvas> with a WebGL 2 context
        this.canvas = document.getElementById(canvas_id);
        this.canvas.width = width;
        this.canvas.height = height;
        this.gl = this.canvas.getContext('webgl2');
        if (!this.gl) {
            alert('Unable to initialize WebGL 2. Your browser may not support it.');
        }

        // initialize local data members
        this.shader = {                                   // Each shader object will contain the GPU program
            gouraud_color: null,                          // (vertex shader + fragment shader) and its
            gouraud_texture: null,                        // corresponding uniform variables
            phong_color: null,
            phong_texture: null
        };

        this.vertex_position_attrib = 0;                  // vertex attribute 0: 3D position
        this.vertex_normal_attrib = 1;                    // vertex attribute 1: 3D normal vector
        this.vertex_texcoord_attrib = 2;                  // vertex attribute 2: 2D texture coordinates

        this.projection_matrix = glMatrix.mat4.create();  // projection matrix (on CPU)
        this.view_matrix = glMatrix.mat4.create();        // view matrix (on CPU)
        this.model_matrix = glMatrix.mat4.create();       // model matrix (on CPU)

        this.vertex_array = {                             // model Vertex Array Objects (contains all attributes
            plane: null,                                  // of the model - vertices, normals, faces, ...)
            cube: null,
            sphere: null
        };

        this.scene = scene;                               // current scene to draw (list of models and lights)
        this.algorithm = 'gouraud';                       // current shading algorithm to use for rendering


        // download and compile shaders into GPU program
        let gouraud_color_vs = this.GetFile('shaders/gouraud_color.vert');
        let gouraud_color_fs = this.GetFile('shaders/gouraud_color.frag');
        let gouraud_texture_vs = this.GetFile('shaders/gouraud_texture.vert');
        let gouraud_texture_fs = this.GetFile('shaders/gouraud_texture.frag');
        let phong_color_vs = this.GetFile('shaders/phong_color.vert');
        let phong_color_fs = this.GetFile('shaders/phong_color.frag');
        let phong_texture_vs = this.GetFile('shaders/phong_texture.vert');
        let phong_texture_fs = this.GetFile('shaders/phong_texture.frag');
        let emissive_vs = this.GetFile('shaders/emissive.vert');
        let emissive_fs = this.GetFile('shaders/emissive.frag');

        Promise.all([gouraud_color_vs, gouraud_color_fs, gouraud_texture_vs, gouraud_texture_fs,
                     phong_color_vs, phong_color_fs, phong_texture_vs, phong_texture_fs,
                     emissive_vs, emissive_fs])
        .then((shaders) => this.LoadAllShaders(shaders))
        .catch((error) => this.GetFileError(error));
    }

    InitializeGlApp() {
        // set drawing area to be the entire framebuffer
        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        // set the background color to a light gray
        this.gl.clearColor(0.8, 0.8, 0.8, 1.0);
        // enable z-buffer for visible surface determination
        this.gl.enable(this.gl.DEPTH_TEST);

        // create models - plane, cube, and sphere
        this.vertex_array.plane = CreatePlaneVao(this.gl, this.vertex_position_attrib, 
                                      this.vertex_normal_attrib, this.vertex_texcoord_attrib);
        this.vertex_array.cube = CreateCubeVao(this.gl, this.vertex_position_attrib, 
                                     this.vertex_normal_attrib, this.vertex_texcoord_attrib);
        this.vertex_array.sphere = CreateSphereVao(this.gl, this.vertex_position_attrib, 
                                       this.vertex_normal_attrib, this.vertex_texcoord_attrib);

        // initialize projection matrix with a 45deg field of view
        let fov = 45.0 * (Math.PI / 180.0);
        let aspect = this.canvas.width / this.canvas.height;
        glMatrix.mat4.perspective(this.projection_matrix, fov, aspect, 0.1, 100.0);
        
        // initialize view matrix based on scene's camera location / direction
        let cam_pos = this.scene.camera.position;
        let cam_target = glMatrix.vec3.create();
        let cam_up = this.scene.camera.up;
        glMatrix.vec3.add(cam_target, cam_pos, this.scene.camera.direction);
        glMatrix.mat4.lookAt(this.view_matrix, cam_pos, cam_target, cam_up);

        // render scene
        this.Render();
    }

    InitializeTexture(image_url) {
        // create a texture, and upload a temporary 1px white RGBA array [255,255,255,255]
        let texture = this.gl.createTexture();

        // TODO: set texture parameters and upload a temporary 1px white RGBA array [255,255,255,255]
        // ...

        // download the actual image
        let image = new Image();
        image.crossOrigin = 'anonymous';
        image.addEventListener('load', (event) => {
            // once image is downloaded, update the texture image
            this.UpdateTexture(texture, image);
        }, false);
        image.src = image_url;

        return texture;
    }

    UpdateTexture(texture, image_element) {
        // TODO: update image for specified texture
    }

    Render() {
        // delete previous frame (reset both framebuffer and z-buffer)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        // draw all models
        for (let i = 0; i < this.scene.models.length; i ++) {
            // NOTE: you need to properly select shader here
            let selected_shader = 'emissive';
            this.gl.useProgram(this.shader[selected_shader].program);

            // transform model to proper position, size, and orientation
            glMatrix.mat4.identity(this.model_matrix);
            glMatrix.mat4.translate(this.model_matrix, this.model_matrix, this.scene.models[i].center);
            glMatrix.mat4.rotateZ(this.model_matrix, this.model_matrix, this.scene.models[i].rotate_z);
            glMatrix.mat4.rotateY(this.model_matrix, this.model_matrix, this.scene.models[i].rotate_y);
            glMatrix.mat4.rotateX(this.model_matrix, this.model_matrix, this.scene.models[i].rotate_x);
            glMatrix.mat4.scale(this.model_matrix, this.model_matrix, this.scene.models[i].size);

            this.gl.uniform3fv(this.shader[selected_shader].uniform.material_color, this.scene.models[i].material.color);
            this.gl.uniformMatrix4fv(this.shader[selected_shader].uniform.projection_matrix, false, this.projection_matrix);
            this.gl.uniformMatrix4fv(this.shader[selected_shader].uniform.view_matrix, false, this.view_matrix);
            this.gl.uniformMatrix4fv(this.shader[selected_shader].uniform.model_matrix, false, this.model_matrix);

            this.gl.bindVertexArray(this.vertex_array[this.scene.models[i].type]);
            this.gl.drawElements(this.gl.TRIANGLES, this.vertex_array[this.scene.models[i].type].face_index_count, this.gl.UNSIGNED_SHORT, 0);
            this.gl.bindVertexArray(null);
        }

        // draw all light sources
        for (let i = 0; i < this.scene.light.point_lights.length; i ++) {
            this.gl.useProgram(this.shader['emissive'].program);

            glMatrix.mat4.identity(this.model_matrix);
            glMatrix.mat4.translate(this.model_matrix, this.model_matrix, this.scene.light.point_lights[i].position);
            glMatrix.mat4.scale(this.model_matrix, this.model_matrix, glMatrix.vec3.fromValues(0.1, 0.1, 0.1));


            this.gl.uniform3fv(this.shader['emissive'].uniform.material_color, this.scene.light.point_lights[i].color);
            this.gl.uniformMatrix4fv(this.shader['emissive'].uniform.projection_matrix, false, this.projection_matrix);
            this.gl.uniformMatrix4fv(this.shader['emissive'].uniform.view_matrix, false, this.view_matrix);
            this.gl.uniformMatrix4fv(this.shader['emissive'].uniform.model_matrix, false, this.model_matrix);

            this.gl.bindVertexArray(this.vertex_array['sphere']);
            this.gl.drawElements(this.gl.TRIANGLES, this.vertex_array['sphere'].face_index_count, this.gl.UNSIGNED_SHORT, 0);
            this.gl.bindVertexArray(null);
        }
    }

    UpdateScene(scene) {
        // update scene
        this.scene = scene;
        
        // update view matrix based on camera properties
        let cam_pos = this.scene.camera.position;
        let cam_target = glMatrix.vec3.create();
        let cam_up = this.scene.camera.up;
        glMatrix.vec3.add(cam_target, cam_pos, this.scene.camera.direction);
        glMatrix.mat4.lookAt(this.view_matrix, cam_pos, cam_target, cam_up);

        // render scene
        this.Render();
    }

    SetShadingAlgorithm(algorithm) {
        // update shading algorithm
        this.algorithm = algorithm;

        // render scene
        this.Render();
    }

    GetFile(url) {
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.onreadystatechange = function() {
                if (req.readyState === 4 && req.status === 200) {
                    resolve(req.response);
                }
                else if (req.readyState === 4) {
                    reject({url: req.responseURL, status: req.status});
                }
            };
            req.open('GET', url, true);
            req.send();
        });
    }

    GetFileError(error) {
        console.log('Error:', error);
    }

    LoadAllShaders(shaders) {
        this.LoadShader(shaders[0], shaders[1], 'gouraud_color');
        this.LoadShader(shaders[2], shaders[3], 'gouraud_texture');
        this.LoadShader(shaders[4], shaders[5], 'phong_color');
        this.LoadShader(shaders[6], shaders[7], 'phong_texture');
        this.LoadShader(shaders[8], shaders[9], 'emissive');

        this.InitializeGlApp();
    }

    LoadShader(vert_source, frag_source, program_name, has_texture) {
        // compile vetex shader
        let vertex_shader = this.CompileShader(vert_source, this.gl.VERTEX_SHADER);
        // compile fragment shader
        let fragment_shader = this.CompileShader(frag_source, this.gl.FRAGMENT_SHADER);

        // create GPU program from the compiled vertex and fragment shaders
        let program = this.CreateShaderProgram(vertex_shader, fragment_shader);

        // specify input and output attributes for the GPU program
        this.gl.bindAttribLocation(program, this.vertex_position_attrib, "vertex_position");
        this.gl.bindAttribLocation(program, this.vertex_normal_attrib, "vertex_normal");
        this.gl.bindAttribLocation(program, this.vertex_texcoord_attrib, 'vertex_texcoord');
        this.gl.bindAttribLocation(program, 0, "FragColor");

        // link compiled GPU program
        this.LinkShaderProgram(program);

        // get handles to uniform variables defined in the shaders
        let num_uniforms = this.gl.getProgramParameter(program, this.gl.ACTIVE_UNIFORMS);
        let uniform = {};
        let i;
        for (i = 0; i < num_uniforms; i++) {
            let info = this.gl.getActiveUniform(program, i);
            uniform[info.name] = this.gl.getUniformLocation(program, info.name);
        }

        this.shader[program_name] = {
            program: program,
            uniform: uniform
        }
    }

    CompileShader(source, type) {
        // create a shader object
        let shader = this.gl.createShader(type);

        // send the source to the shader object
        this.gl.shaderSource(shader, source);

        // compile the shader program
        this.gl.compileShader(shader);

        // check to see if it compiled successfully
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            alert("An error occurred compiling the shader: " + this.gl.getShaderInfoLog(shader));
        }

        return shader;
    }

    CreateShaderProgram(vertex_shader, fragment_shader) {
        // create a GPU program
        let program = this.gl.createProgram();
        
        // attach the vertex and fragment shaders to that program
        this.gl.attachShader(program, vertex_shader);
        this.gl.attachShader(program, fragment_shader);

        // return the program
        return program;
    }

    LinkShaderProgram(program) {
        // link GPU program
        this.gl.linkProgram(program);

        // check to see if it linked successfully
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            alert("An error occurred linking the shader program.");
        }
    }
}
