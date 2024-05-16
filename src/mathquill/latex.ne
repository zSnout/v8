@{%
import { compile } from "./moo"

const bracket = ([,,x]) => x

const lexer = compile({
  ws: /[ \t]/,

  gl: /{/,
  gr: /}/,

  lparen: /(?:\\left)?\(/,
  rparen: /(?:\\right)?\)/,
  lbrack: /(?:\\left)?\[/,
  rbrack: /(?:\\right)?\]/,
  lbrace: /(?:\\left)?\\{/,
  rbrace: /(?:\\right)?\\}/,
  labs: /\\left\|/,
  rabs: /\\right\|/,
  lvert: /(?:\\left)?\\lVert/,
  rvert: /(?:\\right)?\\rVert/,
  langle: /(?:\\left)?\\langle/,
  rangle: /(?:\\right)?\\rangle/,

  number: /[0-9]+(?:\.[0-9]+)?|\.[0-9]+?/,
  letter:
    /[A-Za-z]|\\(?:varepsilon|nparallel|parallel|varsigma|vartheta|varkappa|epsilon|upsilon|digamma|Upsilon|square|varphi|varrho|lambda|Lambda|forall|alpha|gamma|delta|theta|kappa|sigma|omega|varpi|Gamma|Delta|Theta|Sigma|Omega|perp|beta|zeta|iota|mid|eta|rho|tau|chi|psi|phi|Phi|Psi|mu|nu|xi|pi|Xi|Pi)/,
  trig: /\\(?:arc)?(?:sin|cos|tan|csc|sec|cot)h?/,
  op: /\\[A-Za-z]+|./,
})
%}

# Pass your lexer object using the @lexer option:
@lexer lexer
@preprocessor typescript

main -> expr {%id%}
expr -> expr_binding {%id%}

########################

_ -> %ws:?

########################

leaf -> inside_unary_prefix {%id%}

inside_unary_prefix -> inside_unary_suffix {%id%} | unary {%id%}

inside_unary_suffix -> number {%id%} | frac {%id%} | power {%id%} | v {%id%} | vsub {%id%} | bracket {%id%} | sqrt {%id%} | nthroot {%id%} | dual {%id%} | binom {%id%} | factorial {%id%} | power {%id%}

########################

op_multiplication -> "*" {%id%} | "/" {%id%} | "\\cdot" {%id%} | "·" {%id%} | "×" {%id%} | "⨯" {%id%} | "\\div" {%id%} | "\\operatorname{mod}" {%id%} | "\\%" {%id%} | "\\times" {%id%} | "#" {%id%} | "\\#" {%id%} | "%" {%id%}
multiplication -> multiplication _ op_multiplication _ leaf {% ([a,,op,,b]) => ({type:"binary",op,a,b}) %}
expr_multiplication -> multiplication {%id%} | leaf {%id%}

op_addition -> "+" {%id%} | "-" {%id%} | "\\pm" {%id%} | "\\mp" {%id%} | "−" {%id%}
addition -> addition _ op_addition _ multiplication {% ([a,,op,,b]) => ({type:"binary",op,a,b}) %}
expr_addition -> addition {%id%} | expr_multiplication {%id%}

op_equality -> "=" {%id%} | "\\ne" {%id%}
equality -> equality _ op_equality _ addition {% ([a,,op,,b]) => ({type:"binary",op,a,b}) %}
expr_equality -> equality {%id%} | expr_addition {%id%}

op_comparison -> "<" {%id%} | ">" {%id%} | "\\le" {%id%} | "\\ge" {%id%}
comparison -> comparison _ op_comparison _ equality {% ([a,,op,,b]) => ({type:"binary",op,a,b}) %}
expr_comparison -> comparison {%id%} | expr_equality {%id%}

op_boolean_unary -> "\\operatorname{not}" {%id%}
boolean_unary -> op_boolean_unary _ comparison {% ([op,,a]) => ({type:"unary",op,a}) %}
expr_boolean_unary -> boolean_unary {%id%} | expr_comparison {%id%}

op_boolean -> "\\operatorname{and}" {%id%} | "\\operatorname{or}" {%id%} | "\\operatorname{xor}" {%id%}
boolean -> boolean _ op_boolean _ boolean_unary {% ([a,,op,,b]) => ({type:"binary",op,a,b}) %}
expr_boolean -> boolean {%id%} | expr_boolean_unary {%id%}

op_binding -> "\\operatorname{for}" {%id%} | "\\operatorname{with}" {%id%}
binding -> binding _ op_binding _ boolean {% ([a,,op,,b]) => ({type:"binary",op,a,b}) %}
expr_binding -> binding {%id%} | expr_boolean {%id%}

########################

number -> %number

bracket -> %lparen _ expr _ %rparen {%bracket%} | %lbrack _ expr _ %rbrack {%bracket%} | %lbrace _ expr _ %rbrace {%bracket%} | %labs _ expr _ %rabs {%bracket%} | %lvert _ expr _ %rvert {%bracket%} | %langle _ expr _ %rangle {%bracket%}

sqrt -> "\\sqrt" _ "{" _ expr _ "}" {% ([,,,,x])=>({type:"sqrt",contents:x}) %}

nthroot -> "\\sqrt" _ "[" _ expr _ "]" _ "{" _ expr _ "}" {% ([,,,,x,,,,,y])=>({type:"nthroot",root:x,contents:y}) %}

dual -> "\\dual" _ "{" _ expr _ "}" _ "{" _ expr _ "}" {% ([,,,,x,,,,,y])=>({type:"dual",main:x,second:y}) %}

binom -> "\\binom" _ "{" _ expr _ "}" _ "{" _ expr _ "}" {% ([,,,,x,,,,,y])=>({type:"binom",top:x,bottom:y}) %}

factorial -> inside_unary_suffix _ "!" {% ([x])=>({type:"factorial",contents:x}) %}

frac -> "\\frac" _ "{" _ expr _ "}" _ "{" _ expr _ "}" {% ([,,,,x,,,,,y])=>({type:"frac",top:x,bottom:y}) %}

power -> inside_unary_suffix _ "^" _ "{" _ expr _ "}" {% ([x,,,,,,y])=>({type:"power",base:x,power:y}) %}

v -> %letter {% (x) => ({type:"v",name:x}) %}

vsub -> %letter _ "_" _ "{" _ expr _ "}" {% ([x,,,,,,y])=>({type:"vsub",name:x,sub:y}) %}

unary_head -> "sin" {%id%} | "arcsin" {%id%} | "sinh" {%id%} | "arcsinh" {%id%} | "cos" {%id%} | "arccos" {%id%} | "cosh" {%id%} | "arccosh" {%id%} | "tan" {%id%} | "arctan" {%id%} | "tanh" {%id%} | "arctanh" {%id%} | "csc" {%id%} | "arccsc" {%id%} | "csch" {%id%} | "arccsch" {%id%} | "sec" {%id%} | "arcsec" {%id%} | "sech" {%id%} | "arcsech" {%id%} | "cot" {%id%} | "arccot" {%id%} | "coth" {%id%} | "arccoth" {%id%} | "log" {%id%} | "ln" {%id%} | "exp" {%id%} | "floor" {%id%} | "ceil" {%id%} | "not" {%id%} | "real" {%id%} | "imag" {%id%}

unary_tag -> "\\" unary_head {% ([,x])=>x %} | "\\operatorname{" unary_head "}" {% ([,x])=>x %}

unary -> unary_tag inside_unary_prefix {% ([x,y])=>({type:"unary",name:x,contents:y}) %}
