#version 300 es

precision mediump float;

in vec3 frag_pos;
in vec3 frag_normal;

uniform vec3 light_ambient;
uniform vec3 light_position;
uniform vec3 light_color;
uniform vec3 camera_position;
uniform vec3 material_color;      // Ka and Kd
uniform vec3 material_specular;   // Ks
uniform float material_shininess; // n

out vec4 FragColor;

void main() {
    // Peter implemented FragColor
    vec3 N = normalize(frag_normal);
    vec3 L = light_position - frag_pos;
    L = normalize(L);
    float diffuseDot = dot(N,L);
    diffuseDot = max(0.0,diffuseDot);
    vec3 diffuse = light_color * diffuseDot; // diffuse calc

    vec3 R = (2.0 * diffuseDot) * N - L;
    vec3 V = camera_position - frag_pos;
    V = normalize(V);
    float specularDot = dot(R,V);
    specularDot = max (0.0,specularDot);
    vec3 specular = light_color * pow(specularDot,material_shininess); // specular calc

    vec3 FragHolder = (light_ambient * material_color) + (diffuse * material_color) + (specular * material_specular);

    FragColor = vec4(FragHolder, 1.0); // FragColor out
}
