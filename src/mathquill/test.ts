const LatexCmds: Record<
  string,
  { latex: string; html: string; label: string }
> = {}

function bindVanillaSymbol(latex: string, html: string, label: string) {
  return { latex, html, label }
}

function bindVariable(latex: string, html: string, label: string) {
  return { latex, html, label }
}

function NonSymbolaSymbol(latex: string, html: string, label: string) {
  return { latex, html, label }
}

LatexCmds["'"] = LatexCmds.prime = bindVanillaSymbol("'", "&prime;", "prime")
LatexCmds["\u2033"] = LatexCmds.dprime = bindVanillaSymbol(
  "\u2033",
  "&Prime;",
  "double prime",
)
LatexCmds.backslash = bindVanillaSymbol("\\backslash ", "\\", "backslash")

LatexCmds.$ = bindVanillaSymbol("\\$", "$", "dollar")
LatexCmds.square = bindVanillaSymbol("\\square ", "\u25A1", "square")
LatexCmds.mid = bindVanillaSymbol("\\mid ", "\u2223", "mid")
LatexCmds["\u2225"] = LatexCmds.parallel = bindVanillaSymbol(
  "\\parallel ",
  "&#x2225;",
  "parallel",
)
LatexCmds["\u2226"] = LatexCmds.nparallel = bindVanillaSymbol(
  "\\nparallel ",
  "&#x2226;",
  "not parallel",
)
LatexCmds["\u27c2"] = LatexCmds.perp = bindVanillaSymbol(
  "\\perp ",
  "&#x27C2;",
  "perpendicular",
)
//the following are all Greek to me, but this helped a lot: http://www.ams.org/STIX/ion/stixsig03.html
//lowercase Greek letter variables
function bindLowercaseGreek(latex: string) {
  return bindVariable("\\" + latex + " ", "&" + latex + ";", latex)
}
LatexCmds["\u03b1"] = LatexCmds.alpha = bindLowercaseGreek("alpha")
LatexCmds["\u03b2"] = LatexCmds.beta = bindLowercaseGreek("beta")
LatexCmds["\u03b3"] = LatexCmds.gamma = bindLowercaseGreek("gamma")
LatexCmds["\u03b4"] = LatexCmds.delta = bindLowercaseGreek("delta")
LatexCmds["\u03b6"] = LatexCmds.zeta = bindLowercaseGreek("zeta")
LatexCmds["\u03b7"] = LatexCmds.eta = bindLowercaseGreek("eta")
LatexCmds["\u03b8"] = LatexCmds.theta = bindLowercaseGreek("theta")
LatexCmds["\u03b9"] = LatexCmds.iota = bindLowercaseGreek("iota")
LatexCmds["\u03ba"] = LatexCmds.kappa = bindLowercaseGreek("kappa")
LatexCmds["\u03bc"] = LatexCmds.mu = bindLowercaseGreek("mu")
LatexCmds["\u03bd"] = LatexCmds.nu = bindLowercaseGreek("nu")
LatexCmds["\u03be"] = LatexCmds.xi = bindLowercaseGreek("xi")
LatexCmds["\u03c1"] = LatexCmds.rho = bindLowercaseGreek("rho")
LatexCmds["\u03c3"] = LatexCmds.sigma = bindLowercaseGreek("sigma")
LatexCmds["\u03c4"] = LatexCmds.tau = bindLowercaseGreek("tau")
LatexCmds["\u03c7"] = LatexCmds.chi = bindLowercaseGreek("chi")
LatexCmds["\u03c8"] = LatexCmds.psi = bindLowercaseGreek("psi")
LatexCmds["\u03c9"] = LatexCmds.omega = bindLowercaseGreek("omega")
//why can't anybody FUCKING agree on these
LatexCmds["\u03d5"] = LatexCmds.phi = bindVariable("\\phi ", "&#981;", "phi") //W3C or Unicode?
LatexCmds["\u03c6"] =
  LatexCmds.phiv =
  LatexCmds.varphi =
    bindVariable("\\varphi ", "&phi;", "phi") //Elsevier and 9573-13 //AMS and LaTeX
LatexCmds["\u03f5"] = LatexCmds.epsilon = bindVariable(
  "\\epsilon ",
  "&#1013;",
  "epsilon",
) //W3C or Unicode?
LatexCmds["\u03b5"] =
  LatexCmds.epsiv =
  LatexCmds.varepsilon =
    bindVariable(
      //Elsevier and 9573-13 //AMS and LaTeX
      "\\varepsilon ",
      "&epsilon;",
      "epsilon",
    )
LatexCmds["\u03d6"] =
  LatexCmds.piv =
  LatexCmds.varpi =
    bindVariable("\\varpi ", "&piv;", "piv") //W3C/Unicode and Elsevier and 9573-13 //AMS and LaTeX
LatexCmds["\u03c2"] = // Unicode
  LatexCmds.sigmaf = //W3C/Unicode
  LatexCmds.sigmav = //Elsevier
  LatexCmds.varsigma = //LaTeX
    bindVariable("\\varsigma ", "&sigmaf;", "sigma")
LatexCmds["\u03d1"] = // Unicode
  LatexCmds.thetav = //Elsevier and 9573-13
  LatexCmds.vartheta = //AMS and LaTeX
  LatexCmds.thetasym = //W3C/Unicode
    bindVariable("\\vartheta ", "&thetasym;", "theta")
LatexCmds["\u03c5"] =
  LatexCmds.upsilon =
  LatexCmds.upsi =
    bindVariable(
      //AMS and LaTeX and W3C/Unicode //Elsevier and 9573-13
      "\\upsilon ",
      "&upsilon;",
      "upsilon",
    )
//these aren't even mentioned in the HTML character entity references
LatexCmds["\u03dc"] =
  LatexCmds.gammad = //Elsevier
  LatexCmds.Gammad = //9573-13 -- WTF, right? I dunno if this was a typo in the reference (see above)
  LatexCmds.digamma = //LaTeX
    bindVariable("\\digamma ", "&#989;", "gamma")
LatexCmds["\u03f0"] =
  LatexCmds.kappav =
  LatexCmds.varkappa =
    bindVariable(
      //Elsevier //AMS and LaTeX
      "\\varkappa ",
      "&#1008;",
      "kappa",
    )
LatexCmds["\u03f1"] =
  LatexCmds.rhov =
  LatexCmds.varrho =
    bindVariable("\\varrho ", "&#1009;", "rho") //Elsevier and 9573-13 //AMS and LaTeX
//Greek constants, look best in non-italicized Times New Roman
LatexCmds.pi = LatexCmds["\u03c0"] = NonSymbolaSymbol("\\pi ", "&pi;", "pi")

LatexCmds["\u03bb"] = LatexCmds.lambda = NonSymbolaSymbol(
  "\\lambda ",
  "&lambda;",
  "lambda",
)

//uppercase greek letters
LatexCmds["\u03a5"] =
  LatexCmds.Upsilon = //LaTeX
  LatexCmds.Upsi = //Elsevier and 9573-13
  LatexCmds.upsih = //W3C/Unicode "upsilon with hook"
  LatexCmds.Upsih = //'cos it makes sense to me
    NonSymbolaSymbol("\\Upsilon ", "&upsih;", "capital upsilon")
//Symbola's 'upsilon with a hook' is a capital Y without hooks :(
//other symbols with the same LaTeX command and HTML character entity reference
function bindUppercaseGreek(latex: string) {
  return NonSymbolaSymbol("\\" + latex + " ", "&" + latex + ";", latex)
}
LatexCmds["\u0393"] = LatexCmds.Gamma = bindUppercaseGreek("Gamma")
LatexCmds["\u0394"] = LatexCmds.Delta = bindUppercaseGreek("Delta")
LatexCmds["\u0398"] = LatexCmds.Theta = bindUppercaseGreek("Theta")
LatexCmds["\u039b"] = LatexCmds.Lambda = bindUppercaseGreek("Lambda")
LatexCmds["\u039e"] = LatexCmds.Xi = bindUppercaseGreek("Xi")
LatexCmds["\u03a0"] = LatexCmds.Pi = bindUppercaseGreek("Pi")
LatexCmds["\u03a3"] = LatexCmds.Sigma = bindUppercaseGreek("Sigma")
LatexCmds["\u03a6"] = LatexCmds.Phi = bindUppercaseGreek("Phi")
LatexCmds["\u03a8"] = LatexCmds.Psi = bindUppercaseGreek("Psi")
LatexCmds["\u03a9"] = LatexCmds.Omega = bindUppercaseGreek("Omega")
LatexCmds["\u2200"] = LatexCmds.forall = bindUppercaseGreek("forall")

const entries = Object.fromEntries(
  Object.entries(LatexCmds)
    .map(([key, { latex, html, label }]) => {
      const el = document.createElement("p")
      el.innerHTML = html
      return {
        latex: (latex[0] == "\\" ? latex.slice(1) : latex).trim(),
        char: el.textContent,
      }
    })
    .map(({ char, latex }) => [latex, char]),
)
