#version 300 es

precision highp float;

in vec3 vertex_position;
in vec3 vertex_normal;

uniform vec3 light_ambient;
uniform vec3 light_position;
uniform vec3 light_color;
uniform vec3 camera_position;
uniform float material_shininess; // n
uniform mat4 model_matrix;
uniform mat4 view_matrix;
uniform mat4 projection_matrix;

out vec3 ambient;
out vec3 diffuse;
out vec3 specular;

void main() {
    gl_Position = projection_matrix * view_matrix * model_matrix * vec4(vertex_position, 1.0);
    ambient = light_ambient;
    vec4 norm_light_direction = normalize(gl_Position - vec4(light_position, 1.0));
    vec4 dotProd = vec4(dot(normalize(gl_Position), norm_light_direction));
    //left out intensity for now
    diffuse = vec3(dotProd);
    specular = vec3(dot((2.0 * dotProd * (norm_light_direction - normalize(gl_Position))), normalize(gl_Position - vec4(camera_position, 1.0))));
}
