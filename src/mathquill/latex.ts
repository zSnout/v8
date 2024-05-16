// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var ws: any;
declare var number: any;
declare var lparen: any;
declare var rparen: any;
declare var lbrack: any;
declare var rbrack: any;
declare var lbrace: any;
declare var rbrace: any;
declare var labs: any;
declare var rabs: any;
declare var lvert: any;
declare var rvert: any;
declare var langle: any;
declare var rangle: any;
declare var letter: any;

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

interface NearleyToken {
  value: any;
  [key: string]: any;
};

interface NearleyLexer {
  reset: (chunk: string, info: any) => void;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: never) => string;
  has: (tokenType: string) => boolean;
};

interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any;
};

type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

interface Grammar {
  Lexer: NearleyLexer | undefined;
  ParserRules: NearleyRule[];
  ParserStart: string;
};

const grammar: Grammar = {
  Lexer: lexer,
  ParserRules: [
    {"name": "main", "symbols": ["expr"], "postprocess": id},
    {"name": "expr", "symbols": ["expr_binding"], "postprocess": id},
    {"name": "_$ebnf$1", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": id},
    {"name": "_$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "_", "symbols": ["_$ebnf$1"]},
    {"name": "leaf", "symbols": ["inside_unary_prefix"], "postprocess": id},
    {"name": "inside_unary_prefix", "symbols": ["inside_unary_suffix"], "postprocess": id},
    {"name": "inside_unary_prefix", "symbols": ["unary"], "postprocess": id},
    {"name": "inside_unary_suffix", "symbols": ["number"], "postprocess": id},
    {"name": "inside_unary_suffix", "symbols": ["frac"], "postprocess": id},
    {"name": "inside_unary_suffix", "symbols": ["power"], "postprocess": id},
    {"name": "inside_unary_suffix", "symbols": ["v"], "postprocess": id},
    {"name": "inside_unary_suffix", "symbols": ["vsub"], "postprocess": id},
    {"name": "inside_unary_suffix", "symbols": ["bracket"], "postprocess": id},
    {"name": "inside_unary_suffix", "symbols": ["sqrt"], "postprocess": id},
    {"name": "inside_unary_suffix", "symbols": ["nthroot"], "postprocess": id},
    {"name": "inside_unary_suffix", "symbols": ["dual"], "postprocess": id},
    {"name": "inside_unary_suffix", "symbols": ["binom"], "postprocess": id},
    {"name": "inside_unary_suffix", "symbols": ["factorial"], "postprocess": id},
    {"name": "inside_unary_suffix", "symbols": ["power"], "postprocess": id},
    {"name": "op_multiplication", "symbols": [{"literal":"*"}], "postprocess": id},
    {"name": "op_multiplication", "symbols": [{"literal":"/"}], "postprocess": id},
    {"name": "op_multiplication", "symbols": [{"literal":"\\cdot"}], "postprocess": id},
    {"name": "op_multiplication", "symbols": [{"literal":"·"}], "postprocess": id},
    {"name": "op_multiplication", "symbols": [{"literal":"×"}], "postprocess": id},
    {"name": "op_multiplication", "symbols": [{"literal":"⨯"}], "postprocess": id},
    {"name": "op_multiplication", "symbols": [{"literal":"\\div"}], "postprocess": id},
    {"name": "op_multiplication", "symbols": [{"literal":"\\operatorname{mod}"}], "postprocess": id},
    {"name": "op_multiplication", "symbols": [{"literal":"\\%"}], "postprocess": id},
    {"name": "op_multiplication", "symbols": [{"literal":"\\times"}], "postprocess": id},
    {"name": "op_multiplication", "symbols": [{"literal":"#"}], "postprocess": id},
    {"name": "op_multiplication", "symbols": [{"literal":"\\#"}], "postprocess": id},
    {"name": "op_multiplication", "symbols": [{"literal":"%"}], "postprocess": id},
    {"name": "multiplication", "symbols": ["multiplication", "_", "op_multiplication", "_", "leaf"], "postprocess": ([a,,op,,b]) => ({type:"binary",op,a,b})},
    {"name": "expr_multiplication", "symbols": ["multiplication"], "postprocess": id},
    {"name": "expr_multiplication", "symbols": ["leaf"], "postprocess": id},
    {"name": "op_addition", "symbols": [{"literal":"+"}], "postprocess": id},
    {"name": "op_addition", "symbols": [{"literal":"-"}], "postprocess": id},
    {"name": "op_addition", "symbols": [{"literal":"\\pm"}], "postprocess": id},
    {"name": "op_addition", "symbols": [{"literal":"\\mp"}], "postprocess": id},
    {"name": "op_addition", "symbols": [{"literal":"−"}], "postprocess": id},
    {"name": "addition", "symbols": ["addition", "_", "op_addition", "_", "multiplication"], "postprocess": ([a,,op,,b]) => ({type:"binary",op,a,b})},
    {"name": "expr_addition", "symbols": ["addition"], "postprocess": id},
    {"name": "expr_addition", "symbols": ["expr_multiplication"], "postprocess": id},
    {"name": "op_equality", "symbols": [{"literal":"="}], "postprocess": id},
    {"name": "op_equality", "symbols": [{"literal":"\\ne"}], "postprocess": id},
    {"name": "equality", "symbols": ["equality", "_", "op_equality", "_", "addition"], "postprocess": ([a,,op,,b]) => ({type:"binary",op,a,b})},
    {"name": "expr_equality", "symbols": ["equality"], "postprocess": id},
    {"name": "expr_equality", "symbols": ["expr_addition"], "postprocess": id},
    {"name": "op_comparison", "symbols": [{"literal":"<"}], "postprocess": id},
    {"name": "op_comparison", "symbols": [{"literal":">"}], "postprocess": id},
    {"name": "op_comparison", "symbols": [{"literal":"\\le"}], "postprocess": id},
    {"name": "op_comparison", "symbols": [{"literal":"\\ge"}], "postprocess": id},
    {"name": "comparison", "symbols": ["comparison", "_", "op_comparison", "_", "equality"], "postprocess": ([a,,op,,b]) => ({type:"binary",op,a,b})},
    {"name": "expr_comparison", "symbols": ["comparison"], "postprocess": id},
    {"name": "expr_comparison", "symbols": ["expr_equality"], "postprocess": id},
    {"name": "op_boolean_unary", "symbols": [{"literal":"\\operatorname{not}"}], "postprocess": id},
    {"name": "boolean_unary", "symbols": ["op_boolean_unary", "_", "comparison"], "postprocess": ([op,,a]) => ({type:"unary",op,a})},
    {"name": "expr_boolean_unary", "symbols": ["boolean_unary"], "postprocess": id},
    {"name": "expr_boolean_unary", "symbols": ["expr_comparison"], "postprocess": id},
    {"name": "op_boolean", "symbols": [{"literal":"\\operatorname{and}"}], "postprocess": id},
    {"name": "op_boolean", "symbols": [{"literal":"\\operatorname{or}"}], "postprocess": id},
    {"name": "op_boolean", "symbols": [{"literal":"\\operatorname{xor}"}], "postprocess": id},
    {"name": "boolean", "symbols": ["boolean", "_", "op_boolean", "_", "boolean_unary"], "postprocess": ([a,,op,,b]) => ({type:"binary",op,a,b})},
    {"name": "expr_boolean", "symbols": ["boolean"], "postprocess": id},
    {"name": "expr_boolean", "symbols": ["expr_boolean_unary"], "postprocess": id},
    {"name": "op_binding", "symbols": [{"literal":"\\operatorname{for}"}], "postprocess": id},
    {"name": "op_binding", "symbols": [{"literal":"\\operatorname{with}"}], "postprocess": id},
    {"name": "binding", "symbols": ["binding", "_", "op_binding", "_", "boolean"], "postprocess": ([a,,op,,b]) => ({type:"binary",op,a,b})},
    {"name": "expr_binding", "symbols": ["binding"], "postprocess": id},
    {"name": "expr_binding", "symbols": ["expr_boolean"], "postprocess": id},
    {"name": "number", "symbols": [(lexer.has("number") ? {type: "number"} : number)]},
    {"name": "bracket", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "expr", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": bracket},
    {"name": "bracket", "symbols": [(lexer.has("lbrack") ? {type: "lbrack"} : lbrack), "_", "expr", "_", (lexer.has("rbrack") ? {type: "rbrack"} : rbrack)], "postprocess": bracket},
    {"name": "bracket", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", "expr", "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": bracket},
    {"name": "bracket", "symbols": [(lexer.has("labs") ? {type: "labs"} : labs), "_", "expr", "_", (lexer.has("rabs") ? {type: "rabs"} : rabs)], "postprocess": bracket},
    {"name": "bracket", "symbols": [(lexer.has("lvert") ? {type: "lvert"} : lvert), "_", "expr", "_", (lexer.has("rvert") ? {type: "rvert"} : rvert)], "postprocess": bracket},
    {"name": "bracket", "symbols": [(lexer.has("langle") ? {type: "langle"} : langle), "_", "expr", "_", (lexer.has("rangle") ? {type: "rangle"} : rangle)], "postprocess": bracket},
    {"name": "sqrt", "symbols": [{"literal":"\\sqrt"}, "_", {"literal":"{"}, "_", "expr", "_", {"literal":"}"}], "postprocess": ([,,,,x])=>({type:"sqrt",contents:x})},
    {"name": "nthroot", "symbols": [{"literal":"\\sqrt"}, "_", {"literal":"["}, "_", "expr", "_", {"literal":"]"}, "_", {"literal":"{"}, "_", "expr", "_", {"literal":"}"}], "postprocess": ([,,,,x,,,,,y])=>({type:"nthroot",root:x,contents:y})},
    {"name": "dual", "symbols": [{"literal":"\\dual"}, "_", {"literal":"{"}, "_", "expr", "_", {"literal":"}"}, "_", {"literal":"{"}, "_", "expr", "_", {"literal":"}"}], "postprocess": ([,,,,x,,,,,y])=>({type:"dual",main:x,second:y})},
    {"name": "binom", "symbols": [{"literal":"\\binom"}, "_", {"literal":"{"}, "_", "expr", "_", {"literal":"}"}, "_", {"literal":"{"}, "_", "expr", "_", {"literal":"}"}], "postprocess": ([,,,,x,,,,,y])=>({type:"binom",top:x,bottom:y})},
    {"name": "factorial", "symbols": ["inside_unary_suffix", "_", {"literal":"!"}], "postprocess": ([x])=>({type:"factorial",contents:x})},
    {"name": "frac", "symbols": [{"literal":"\\frac"}, "_", {"literal":"{"}, "_", "expr", "_", {"literal":"}"}, "_", {"literal":"{"}, "_", "expr", "_", {"literal":"}"}], "postprocess": ([,,,,x,,,,,y])=>({type:"frac",top:x,bottom:y})},
    {"name": "power", "symbols": ["inside_unary_suffix", "_", {"literal":"^"}, "_", {"literal":"{"}, "_", "expr", "_", {"literal":"}"}], "postprocess": ([x,,,,,,y])=>({type:"power",base:x,power:y})},
    {"name": "v", "symbols": [(lexer.has("letter") ? {type: "letter"} : letter)], "postprocess": (x) => ({type:"v",name:x})},
    {"name": "vsub", "symbols": [(lexer.has("letter") ? {type: "letter"} : letter), "_", {"literal":"_"}, "_", {"literal":"{"}, "_", "expr", "_", {"literal":"}"}], "postprocess": ([x,,,,,,y])=>({type:"vsub",name:x,sub:y})},
    {"name": "unary_head", "symbols": [{"literal":"sin"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"arcsin"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"sinh"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"arcsinh"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"cos"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"arccos"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"cosh"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"arccosh"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"tan"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"arctan"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"tanh"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"arctanh"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"csc"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"arccsc"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"csch"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"arccsch"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"sec"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"arcsec"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"sech"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"arcsech"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"cot"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"arccot"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"coth"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"arccoth"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"log"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"ln"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"exp"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"floor"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"ceil"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"not"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"real"}], "postprocess": id},
    {"name": "unary_head", "symbols": [{"literal":"imag"}], "postprocess": id},
    {"name": "unary_tag", "symbols": [{"literal":"\\"}, "unary_head"], "postprocess": ([,x])=>x},
    {"name": "unary_tag", "symbols": [{"literal":"\\operatorname{"}, "unary_head", {"literal":"}"}], "postprocess": ([,x])=>x},
    {"name": "unary", "symbols": ["unary_tag", "inside_unary_prefix"], "postprocess": ([x,y])=>({type:"unary",name:x,contents:y})}
  ],
  ParserStart: "main",
};

export default grammar;
