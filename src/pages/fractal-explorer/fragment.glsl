#version 300 es

precision highp float;

uniform float u_detail;
uniform float u_detail_min;
uniform float u_fractal_size;
uniform float u_theme;
uniform float u_inner_theme;
uniform float u_plot_size;
uniform vec2 u_slider;
uniform vec2 u_mouse;
uniform vec2 u_time;

uniform bool u_effect_outer_a;
uniform bool u_effect_outer_b;
uniform bool u_effect_outer_c;
uniform bool u_effect_inner_a;
uniform bool u_effect_inner_b;

uniform bool u_effect_split;
uniform bool u_effect_alt_colors;
uniform bool u_dual_enabled;

in vec4 position;
in vec4 coords;
in vec4 coords_for_dual;
out vec4 color;

#include "../../shaders/rgb-to-hsv.glsl"
#include "../../shaders/color-modifier.glsl"
#include "../../shaders/complex.glsl"

vec3 simple_palette(vec2 z, float i) {
  vec3 original = vec3(
    u_effect_outer_a && z.y < 0.0
      ? -i / 50.0
      : i / 50.0,
    1.0,
    1.0
  );

  vec3 rgb = hsv2rgb(modify_hsv(original));
  if (u_effect_outer_c) {
    rgb *= mod(i * 0.02, 1.0);
  }

  return rgb;
}

vec3 gradient_palette(vec3 sz, float i, bool is_outer) {
  if (i != 0.0) {
    sz = abs(sz) / i;
  }

  vec3 rgb = sin(abs(sz * 5.0)) * 0.45 + 0.5;
  rgb = modify_rgb(rgb);
  if (is_outer && u_effect_outer_c) {
    rgb *= mod(i * 0.02, 1.0);
  }
  return rgb;
}

vec3 plot_palette(vec2 z, float i, bool is_outer) {
  float hue =
    atan(z.y, z.x) / 6.2831853071795864769252867665590057683943387987502;

  if (isinf(z.x) || isinf(z.y) || isnan(z.x) || isnan(z.y)) {
    return vec3(0.5, 0.5, 0.5);
  }

  float r = length(z) / u_plot_size;
  r = min(r, 1.0);
  r = sqrt(r);

  vec3 rgb = hsv2rgb(modify_hsv(vec3(hue, 1.0, r)));
  if (is_outer && u_effect_outer_c) {
    rgb *= mod(i * 0.02, 1.0);
  }
  return rgb;
}

vec3 trig_palette(float i) {
  float t = i * -0.1 * u_color_repetition;

  float n1, n2;
  if (u_effect_outer_a) {
    n1 = 1.0 / sin(t) * 0.5 + 0.5;
    n2 = 1.0 / tan(t) * 0.5 + 0.5;
  } else {
    n1 = sin(t) * 0.5 + 0.5;
    n2 = cos(t) * 0.5 + 0.5;
  }

  vec3 rgb;
  if (u_effect_outer_b) {
    rgb = vec3(n2, n2, n1);
  } else {
    rgb = vec3(n1, u_effect_outer_a ? 0.5 : 1.0, n2);
  }

  rgb = modify_rgb(rgb);
  if (u_effect_outer_c) {
    rgb *= mod(i * 0.02, 1.0);
  }

  return rgb;
}

vec3 noise_palette(vec2 sz) {
  float angle = atan(sz.y / sz.x);
  float hue = angle / 3.14159;
  vec3 hsv = vec3(1.0 - hue, 1.0, 1.0);
  return hsv2rgb(modify_hsv(hsv));
}

void outer_palette(float i, vec2 z, vec3 sz) {
  if (u_theme == 4.0) {
    color = vec4(trig_palette(i), 1.0);
  } else if (u_theme == 3.0) {
    color = vec4(plot_palette(z, i, true), 1);
  } else if (u_theme == 5.0) {
    float x = 0.0;
    if (u_effect_outer_b) {
      x = i / u_detail;
    }
    if (u_effect_outer_a) {
      x = 1.0 - x;
    }
    color = vec4(x, x, x, 1.0);
  } else if (u_theme == 2.0) {
    color = vec4(gradient_palette(sz, i, true), 1.0);
  } else {
    color = vec4(simple_palette(z, i), 1.0);
  }
}

void inner_palette(float i, vec2 z, vec3 sz, vec2 sz2) {
  if (u_inner_theme == 2.0) {
    color = vec4(gradient_palette(sz, i, false), 1.0);
  } else if (u_inner_theme == 3.0) {
    color = vec4(plot_palette(z, i, false), 1);
  } else if (u_inner_theme == 4.0) {
    color = vec4(noise_palette(sz2), 1.0);
  } else {
    if (u_effect_inner_a) {
      color = vec4(1.0, 1.0, 1.0, 1.0);
    } else {
      color = vec4(0.0, 0.0, 0.0, 1.0);
    }
  }
}

void run(vec2 p, vec2 c, vec2 z, bool dual) {
  float i = 0.0;
  for (; i < u_detail; i++) {
    z = EQ;

    if (u_theme != 6.0 && z.x * z.x + z.y * z.y > u_fractal_size) {
      if (i < u_detail_min) {
        return;
      }

      outer_palette(i, z, vec3(0));
      return;
    }

  }

  inner_palette(i, z, vec3(0), vec2(0));
}

void run_with_sz(vec2 p, vec2 c, vec2 z, bool dual) {
  vec2 pz, ppz, sz2;
  vec3 sz, sz_split;

  float i = 0.0;
  for (; i < u_detail; i++) {
    ppz = pz;
    pz = z;
    z = EQ;

    if (u_theme != 6.0 && z.x * z.x + z.y * z.y > u_fractal_size) {
      if (i < u_detail_min) {
        return;
      }

      if (u_effect_outer_a) {
        sz += sz_split;
      }
      outer_palette(i, z, sz);
      return;
    }

    sz2 = sin(sz2 + z) + cos(sz2) + z;
    sz.x += dot(z - pz, pz - ppz);
    sz.y += dot(z - pz, z - pz);
    sz.z += dot(z - ppz, z - ppz);
    sz_split += sign(vec3(float(z), float(pz), float(ppz)));
  }

  if (u_effect_inner_a) {
    sz += sz_split;
  }
  inner_palette(i, z, sz, sz2);
}

void main() {
  vec2 p = coords.xy;
  bool dual = false;

  if (u_dual_enabled && position.x > 0.5 && position.y < 0.5) {
    dual = true;
    p = coords_for_dual.xy;
  }

  vec2 c = EQ_C;
  vec2 z = EQ_Z;

  if (u_theme == 2.0 || u_inner_theme == 2.0 || u_inner_theme == 4.0) {
    run_with_sz(p, c, z, dual);
  } else {
    run(p, c, z, dual);
  }
}
