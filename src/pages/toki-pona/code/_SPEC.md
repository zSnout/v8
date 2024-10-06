Specification for a toki pona based programming language.

# Drafts

These aren't drafts of a specification; they're more like examples of what I
might want the language to look like.

**cat**

```
sike la {
  nimi [nimi] o tan nasin [prompt]
  o mu e [nimi]
}
```

```ts
while (true) {
  const nimi: string = prompt()
  alert(nimi)
}
```

**recursive-style fibonacci numbers**

```
nasin [piponasi] tan {
  nanpa [nanpa] o lon
  pana la nanpa
} la {
  [nanpa] li ala la {
    o pana e ala
  }

  [nanpa] li wan la {
    o pana e wan
  }

  o pana e {
    { nasin [piponasi] { [nanpa] la tu anpa } } la
    { nasin [piponasi] { [nanpa] la wan anpa } } sewi
  }
}
```

```ts
function piponasi(nanpa: number): number {
  if (nanpa == 0) {
    return 0
  }

  if (nanpa == 1) {
    return 1
  }

  return piponasi(nanpa - 1) + piponasi(nanpa - 2)
}
```

**triangular numbers via summed iterator**

```
nasin [compute nth triangular number] tan nanpa [n] la {
  o wan e ale { tan 1 tawa [n] }
  o pana e ni
}
```

```rs
fn compute_nth_triangular_number(n: number) -> number {
  let ni = (1..=n).sum();
  ni
}
```

**group of numbers with cached sum**

```
poki [list with cached sum] la {
  kulupu nanpa [list] o ala
  nanpa [sum] o ala

  nasin [push] tan nanpa [n] la {
    [list] o [push] e [n]
    [sum] o kama [n] sewi
  }

  nasin [pop] la {
    ken nanpa [n] o { nasin [pop] tan [list] }

    [n] li lon la {
      [sum] o kama [n] anpa
    }

    o pana e [n]
  }

  nasin [at] o sama nasin [at] tan [list]

  nasin kulupu la {
    o pana e ale [list]
  }
}
```

```ts
class ListWithCachedSum {
  list: number[] = []
  sum: number = 0

  push(n: number) {
    this.list.push(n)
    this.sum += n
  }

  pop() {
    let n: number | undefined = this.list.pop()

    if (n != null) {
      this.sum -= n
    }

    return n
  }

  at(...args) {
    this.list.at(...args)
  }

  *[Symbol.iterator]() {
    yield* this.list
  }
}
```

# Grammar
