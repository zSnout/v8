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
