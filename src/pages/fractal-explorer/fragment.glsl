#version 300 es

precision highp float;

uniform float u_detail;
uniform float u_detail_min;
uniform float u_fractal_size;
uniform float u_theme;
uniform float u_plot_size;
uniform vec2 u_slider;
uniform vec2 u_mouse;
uniform vec2 u_time;

uniform bool u_effect_split;

in vec4 coords;
out vec4 color;

#include "../../shaders/rgb-to-hsv.glsl"
#include "../../shaders/color-modifier.glsl"
#include "../../shaders/complex.glsl"

void run_simple() {
  vec2 p = coords.xy;
  vec2 c = EQ_C;
  vec2 z = EQ_Z;

  float i = 0.0;
  for (; i < u_detail; i++) {
    z = EQ;

    if (z.x * z.x + z.y * z.y > u_fractal_size) {
      if (i < u_detail_min) {
        return;
      }

      vec3 original = vec3(
        u_effect_split && z.y < 0.0
          ? -i / 50.0
          : i / 50.0,
        1.0,
        1.0
      );

      color = vec4(hsv2rgb(modify_hsv(original)), 1);

      return;
    }
  }

  color = vec4(0, 0, 0, 1);
}

vec3 gradient_palette(vec3 sz, float i) {
  if (i != 0.0) {
    sz = abs(sz) / i;
  }

  vec3 rgb = sin(abs(sz * 5.0)) * 0.45 + 0.5;
  return modify_rgb(rgb);
}

void run_gradient() {
  vec2 p = coords.xy;
  vec2 c = EQ_C;
  vec2 z = EQ_Z;
  vec2 pz, ppz;
  vec3 sz;

  float i = 0.0;
  for (; i < u_detail; i++) {
    ppz = pz;
    pz = z;
    z = EQ;

    if (z.x * z.x + z.y * z.y > u_fractal_size) {
      if (i < u_detail_min) {
        return;
      }

      color = vec4(gradient_palette(sz, i), 1.0);
      return;
    }

    sz.x += dot(z - pz, pz - ppz);
    sz.y += dot(z - pz, z - pz);
    sz.z += dot(z - ppz, z - ppz);

    if (u_effect_split) {
      sz += sign(vec3(float(z), float(pz), float(ppz)));
    }
  }

  color = vec4(gradient_palette(sz, i), 1.0);
}

vec3 plot_palette(vec2 z) {
  float hue =
    atan(z.y, z.x) / 6.2831853071795864769252867665590057683943387987502;

  if (isinf(z.x) || isinf(z.y) || isnan(z.x) || isnan(z.y)) {
    return vec3(1, 1, 1);
  }

  float r = length(z) / u_plot_size;
  r = min(r, 1.0);
  r = sqrt(r);

  return hsv2rgb(modify_hsv(vec3(hue, 1.0, r)));
}

void run_plot() {
  vec2 p = coords.xy;
  vec2 c = EQ_C;
  vec2 z = EQ_Z;

  float i = 0.0;
  for (; i < u_detail; i++) {
    z = EQ;

    if (z.x * z.x + z.y * z.y > u_fractal_size) {
      if (i < u_detail_min) {
        return;
      }

      if (!u_effect_split) {
        color = vec4(plot_palette(z), 1);

        return;
      }

    }
  }

  color = vec4(plot_palette(z), 1);
}

void main() {
  if (u_theme == 2.0) {
    run_gradient();
  } else if (u_theme == 3.0) {
    run_plot();
  } else {
    run_simple();
  }
}
