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
    gl_Position = projection_matrix * view_matrix * model_matrix * vec4(vertex_position, 1.0);
    frag_normal = mat3(transpose(inverse(model_matrix))) * vertex_normal;
    frag_normal = normalize(frag_normal);
    vec4 frag_pos_w = model_matrix * vec4(vertex_position, 1.0);//may be an error with this or the equation
    frag_pos = frag_pos_w.xyz;
}
