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
uniform bool u_effect_alt_colors;
uniform bool u_dual_enabled;
in vec4 position;
in vec4 coords;
in vec4 coords_for_dual;
out vec4 color;
vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-1;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}
const vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
vec3 hsv2rgb(vec3 c) {
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
uniform float u_color_offset;
uniform float u_color_spectrum;
uniform float u_color_smoothness;
uniform float u_color_repetition;
vec3 modify_hsv(vec3 hsv) {
  float hue = hsv.x;
  if (hue == 0.0 && u_color_repetition < 0.0) {
    hue = -0.9999999;
  }
  hue *= u_color_repetition;
  if (u_color_smoothness != 0.0) {
    hue = hue - mod(hue, u_color_smoothness);
  }
  hue = fract(mod(hue, 1.0) * u_color_spectrum);
  hue += u_color_offset;
  return vec3(hue, hsv.yz);
}
vec3 modify_rgb(vec3 rgb) {
  return hsv2rgb(modify_hsv(rgb2hsv(rgb)));
}
vec2 cx_mult(vec2 a, vec2 b) {
  return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}
vec2 cx_div(vec2 a, vec2 b) {
  float d = b.x * b.x + b.y * b.y;
  return vec2((a.x * b.x + a.y * b.y) / d, (a.y * b.x - a.x * b.y) / d);
}
vec2 cx_sin(vec2 z) {
  return vec2(sin(z.x) * cosh(z.y), cos(z.x) * sinh(z.y));
}
vec2 cx_cos(vec2 z) {
  return vec2(cos(z.x) * cosh(z.y), -sin(z.x) * sinh(z.y));
}
vec2 cx_tan(vec2 z) {
  return cx_div(cx_sin(z), cx_cos(z));
}
vec2 cx_exp(vec2 z) {
  float e = exp(z.x);
  return vec2(e * cos(z.y), e * sin(z.y));
}
vec2 cx_ln(vec2 z) {
  return vec2(log(length(z)), atan(z.y, z.x));
}
vec2 cx_log10(vec2 z) {
  return cx_ln(z) / 2.303;
}
vec2 cx_abs(vec2 z) {
  return abs(z);
}
vec2 cx_length(vec2 z) {
  return vec2(length(z), 0);
}
vec2 cx_sqr(vec2 z) {
  return vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y);
}
vec2 cx_cube(vec2 z) {
  return vec2(
    z.x * z.x * z.x - 3.0 * z.x * z.y * z.y,
    3.0 * z.x * z.x * z.y - z.y * z.y * z.y
  );
}
vec2 cx_pow(vec2 a, vec2 b) {
  return cx_exp(cx_mult(b, cx_ln(a)));
}
vec2 cx_real(vec2 z) {
  return vec2(z.x, 0);
}
vec2 cx_imag(vec2 z) {
  return vec2(z.y, 0);
}
vec2 cx_sign(vec2 z) {
  return normalize(z);
}
vec2 cx_angle(vec2 z) {
  return vec2(atan(z.y, z.x), 0);
}
vec3 trig_palette(float i) {
  float t = i * -0.1 * u_color_repetition;
  float n1, n2;
  if (u_effect_split) {
    n1 = 1.0 / sin(t) * 0.5 + 0.5;
    n2 = 1.0 / tan(t) * 0.5 + 0.5;
  } else {
    n1 = sin(t) * 0.5 + 0.5;
    n2 = cos(t) * 0.5 + 0.5;
  }
  vec3 rgb;
  if (u_effect_alt_colors) {
    rgb = vec3(n2, n2, n1);
  } else {
    rgb = vec3(n1, u_effect_split ? 0.5 : 1.0, n2);
  }
  rgb = modify_rgb(rgb);
  return rgb;
}
vec3 simple_palette(vec2 z, float i) {
  vec3 original = vec3(
    u_effect_split && z.y < 0.0
      ? -i / 50.0
      : i / 50.0,
    1.0,
    1.0
  );
  return hsv2rgb(modify_hsv(original));
}
void run_simple(vec2 p, vec2 c, vec2 z, bool dual) {
  float i = 0.0;
  for (; i < u_detail; i++) {
    z = cx_cube(z) - cx_sqr(z) - z - c;
    if (z.x * z.x + z.y * z.y > u_fractal_size) {
      if (i < u_detail_min) {
        return;
      }
      if (u_theme == 4.0) {
        color = vec4(trig_palette(i), 1.0);
      } else {
        color = vec4(simple_palette(z, i), 1.0);
      }
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
void run_gradient(vec2 p, vec2 c, vec2 z, bool dual) {
  vec2 pz, ppz;
  vec3 sz;
  float i = 0.0;
  for (; i < u_detail; i++) {
    ppz = pz;
    pz = z;
    z = cx_cube(z) - cx_sqr(z) - z - c;
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
void run_plot(vec2 p, vec2 c, vec2 z, bool dual) {
  float i = 0.0;
  for (; i < u_detail; i++) {
    z = cx_cube(z) - cx_sqr(z) - z - c;
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
  vec2 p = coords.xy;
  bool dual = false;
  if (u_dual_enabled && position.x > 0.5 && position.y < 0.5) {
    dual = true;
    p = coords_for_dual.xy;
  }
  vec2 c = p;
  vec2 z = vec2(0, 0);
  if (u_theme == 2.0) {
    run_gradient(p, c, z, dual);
  } else if (u_theme == 3.0) {
    run_plot(p, c, z, dual);
  } else {
    run_simple(p, c, z, dual);
  }
}
