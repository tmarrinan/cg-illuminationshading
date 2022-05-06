#version 300 es

precision highp float;

in vec3 vertex_position;
in vec3 vertex_normal;

uniform mat4 model_matrix;
uniform mat4 view_matrix;
uniform mat4 projection_matrix;

out vec3 frag_pos;
out vec3 frag_normal;

void main() {
    // Peter implemented frag_pos and frag_normal
    gl_Position = projection_matrix * view_matrix * model_matrix * vec4(vertex_position, 1.0);
    frag_pos = vec3(model_matrix * vec4(vertex_position, 1.0)); // frag_pos out
    mat3 MVI = transpose(inverse(mat3(model_matrix)));
    frag_normal = MVI * vertex_normal; // frag_normal out
}
