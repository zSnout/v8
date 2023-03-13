#version 300 es

precision highp float;

uniform float u_detail;
uniform float u_detail_min;
uniform float u_fractal_size;
uniform float u_theme;
uniform bool u_split;

in vec4 coords;
out vec4 color;

#include "../../shaders/rgb-to-hsv.glsl"
#include "../../shaders/color-modifier.glsl"

vec2 sqr(vec2 z) {
  return vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y);
}

void run_simple() {
  vec2 c = coords.xy;
  vec2 z;

  float i = 0.0;
  for (; i < u_detail; i++) {
    z = sqr(z) + c;

    if (z.x * z.x + z.y * z.y > u_fractal_size) {
      if (i < u_detail_min) {
        return;
      }

      color = vec4(hsv2rgb(modify_hsv(vec3(i / 50.0, 1.0, 1.0))), 1);
      return;
    }
  }

  color = vec4(0, 0, 0, 1);
}

vec3 gradientPalette(vec3 sz, float i) {
  sz = abs(sz) / i;
  vec3 rgb = sin(abs(sz * 5.0)) * 0.45 + 0.5;
  return modify_rgb(rgb);
}

void run_gradient() {
  vec2 c = coords.xy;
  vec2 pz, ppz, z;
  vec3 sz;

  float i = 0.0;
  for (; i < u_detail; i++) {
    ppz = pz;
    pz = z;
    z = sqr(z) + c;
    i++;

    if (z.x * z.x + z.y * z.y > u_fractal_size) {
      if (i < u_detail_min) return;

      color = vec4(gradientPalette(sz, i), 1.0);
      return;
    }

    sz.x += dot(z - pz, pz - ppz);
    sz.y += dot(z - pz, z - pz);
    sz.z += dot(z - ppz, z - ppz);

    if (u_split) {
      sz += sign(vec3(float(z), float(pz), float(ppz)));
    }
  }

  color = vec4(gradientPalette(sz, i), 1.0);
}

void main() {
  if (u_theme == 2.0) {
    run_gradient();
  } else {
    run_simple();
  }
}
