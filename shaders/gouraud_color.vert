#version 300 es

precision highp float;

in vec3 vertex_position;
in vec3 vertex_normal;

uniform vec3 light_ambient;
uniform vec3 light_position;
uniform vec3 light_color; // I_p
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
    vec3 norm_light_direction = normalize(vertex_position - light_position);

    vec3 dotProd = vec3(dot(vertex_normal, norm_light_direction));
    
    diffuse = light_color * dotProd;
    specular = light_color * pow(dot((2.0 * dotProd * (vertex_normal - vertex_position)), (vertex_position - camera_position)), material_shininess);
}
