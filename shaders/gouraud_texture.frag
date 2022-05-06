#version 300 es

precision mediump float;

in vec3 ambient;
in vec3 diffuse;
in vec3 specular;
in vec2 frag_texcoord;

uniform vec3 material_color;    // Ka and Kd
uniform vec3 material_specular; // Ks
uniform sampler2D image;        // use in conjunction with Ka and Kd

out vec4 FragColor;

void main() {
    // Peter implemented FragHolder
    vec3 FragHolder = (ambient * material_color) + (diffuse * material_color) + (specular * material_specular);
    
    // Ben implemented texture and final
    vec4 myTexture = texture(image, frag_texcoord); 
    vec3 final = myTexture.rgb * FragHolder;
    final = pow(final, vec3(1.0 / 2.2)); //Apply gamma correction to the final values.
    FragColor = myTexture;
    //FragColor = vec4(final, 1.0); // FragColor out
}
