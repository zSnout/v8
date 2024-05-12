#version 300 es

precision highp float;

uniform vec2 u_mouse;
uniform vec2 u_time;
uniform vec2 u_pixel;

in vec4 coords;
out vec4 color;

// #include "../../../shaders/rgb-to-hsv.glsl"
// #include "../../../shaders/color-modifier.glsl"
// #include "../../../shaders/complex.glsl"

float equation(vec2 p) {
  return p.y - p.x * p.x * sin(p.x);
}

void main() {
  vec2 p = coords.xy;

  float l = equation(p + u_pixel / 2.0 * vec2(-1, +0));
  float r = equation(p + u_pixel / 2.0 * vec2(+1, +0));
  float b = equation(p + u_pixel / 2.0 * vec2(+0, -1));
  float t = equation(p + u_pixel / 2.0 * vec2(+0, +1));

  if (
    t < 0.0 && b > 0.0 ||
    l < 0.0 && r > 0.0 ||
    t > 0.0 && b < 0.0 ||
    l > 0.0 && r < 0.0
  ) {
    color = vec4(0.2, 0.3, 0.5, 1.0);
  } else {
    color = vec4(0.9, 1.0, 0.2, 1.0);
  }

  // color = vec4(p, 1.0, 1.0);

}
