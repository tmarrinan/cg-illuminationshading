#version 300 es

precision mediump float;

in vec3 ambient;
in vec3 diffuse;
in vec3 specular;

uniform vec3 material_color;    // Ka and Kd
uniform vec3 material_specular; // Ks

out vec4 FragColor;

void main() {
    vec3 FragHolder = (ambient * material_color) + (diffuse * material_color) + (specular * material_specular);
    FragColor = vec4(FragHolder, 1.0);
}
