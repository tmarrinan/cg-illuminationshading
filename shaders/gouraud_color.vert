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

    vec3 new_position = vec3(model_matrix * vec4(vertex_position, 1.0));
    vec3 new_normal = normalize(vec3(model_matrix * vec4(vertex_normal, 0.0)));

    vec3 norm_light_direction = normalize(light_position - new_position);

    float dotProd = dot(new_normal, norm_light_direction);
    dotProd = dotProd < 0.0 ? 0.0 : dotProd;
    //dotProd = dotProd > 1.0 ? 1.0 : dotProd;
    
    diffuse = light_color * dotProd;

    float powerResult = pow(dot((2.0 * dotProd * (new_normal - new_position)), (new_position - camera_position)), material_shininess);
    powerResult = powerResult < 0.0 ? 0.0 : powerResult;
    //powerResult > 1.0 ? 1.0 : powerResult;

    specular = light_color * powerResult;
}
