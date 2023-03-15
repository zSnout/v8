// Requires rgb-to-hsv.glsl to be included already.

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
