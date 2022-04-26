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
    //normalize light and view
    vec3 N = normalize(frag_normal);
    vec3 L = normalize(light_position-frag_pos);
    vec3 ambientIntensity = light_ambient * material_color;
    float diff = max(dot(N,L), 0.0);
    vec3 diffuseIntensity = light_color * material_color * diff;
    vec3 V = normalize(camera_position - frag_pos);
    vec3 R = 2.0*(max(dot(N,L),0.0))*(N-L);

    vec3 specularIntensity = light_color * material_specular * pow(max(dot(R,V), 0.0),material_shininess);
    vec3 combined = ambientIntensity + diffuseIntensity + specularIntensity;

    FragColor = vec4(combined, 1.0);
}
