---
title: CA — Perspective
---

Perspective is Ithkuil's way of marking number (singular, plural, collective,
etc.). The four Perspectives are:

| Abbr. | Name          | Form  | Meaning                            |
| ----- | ------------- | ----- | ---------------------------------- |
| M     | Monadic       | — (l) | exactly one, singular, singulative |
| G     | Agglomerative | r     | at least one, collective           |
| N     | Nomic         | w (v) | general                            |
| A     | Abstract      | y (j) | -hood/-ness/-ing                   |

Here are some phrases in each Perspective as examples:

| @wrap M (Monadic)         | @wrap G (Agglomerative)              | @wrap N (Nomic)                     | @wrap A (Abstract)                          |
| ------------------------- | ------------------------------------ | ----------------------------------- | ------------------------------------------- |
| a grove                   | at least one grove                   | groves in general                   | grovehood; the idea of being a grove        |
| a set of different rivers | at least one set of different rivers | sets of different rivers in general | the idea of being a set of different rivers |
| a speck of dust           | dust                                 | dust in general                     | the idea of being dust                      |
| a snowflake               | snow                                 | snow in general                     | snowhood; the idea of being snow            |
| an instance of being red  | at least one instance of being red   | red in general                      | redness; to be red                          |
| an instance of singing    | at least one instance of singing     | singing in general                  | to sing; singing                            |

Some important notes:

- **Singular of a group:** Notice how even though we originally created grove as
  "a set of similar, separate trees", which implies a plural of "tree", we can
  still have a singular grove: a single set of similar, separate trees. This
  differs from the Agglomerative, which would indicate at least one set of
  similar, separate trees, or at least one grove.

- **Mass nouns:** English separates nouns into so-called "count nouns", which
  can be counted (trees, rivers, bears, etc.), and "mass nouns", which are
  uncountable (dust, snow, electricity).

  In Ithkuil, these categories don't exist. Instead, mass nouns become their
  smallest units (a speck of dust, a snowflake, a spark of electricity) in the
  Monadic, and their collective forms (dust, snow, electricity) in the
  Agglomerative.

- **The Nomic:** The Nomic is used when you talk about something in general. For
  instance, if I said "I like dogs", I don't mean that I like some particular
  dogs, I mean that I like dogs in general (that is, all dogs). Therefore, "dog"
  goes in the Nomic.

  On verbs, the Nomic indicates things which are always true as a state of
  nature. For instance, if I said "Apples fall downwards", the verb "fall" and
  the noun "apples" would go in the Nomic, since apples fall in general, due to
  the laws of physics.

  If instead "apples" was in the Agglomerative and "fall" was in the Monadic, it
  would become "at least one apple is currently falling downwards", which is
  probably not the intention.

- **The Abstract:** The Abstract is used to talk about the quality of being or
  doing something (as in redness and grovehood). If I said "I like red", it
  would roughly mean "I like things which are red" in the Nomic, but "I like the
  quality of being red" in the Abstract.

  The Abstract is useful for making timeless verbs, like infinitives (to
  breathe, to sing, to walk) and gerunds (breathing, singing, walking). For
  instance, in the sentence "Singing is not their strong suit", the word
  _singing_ goes in the Abstract, since they're bad at the quality of singing.
  Or in "It makes no sense to worry about it", _to worry_ goes in the Abstract,
  since _the quality of worrying about it_ is what doesn't make sense.

@btw Yup, the abbreviations for Perspective are one letter despite all other
Ithkuil abbreviations being three letters. I don't know why.

Adding Perspective to a C<sub>A</sub> form is easy: tack its normal consonant
form (—/r/w/y) after Affiliation, Configuration, and Extension. Like
Affiliation, Perspectives have standalone forms (l/r/v/j) which you use if
nothing else is specified.

@btw This standalone form is how an "empty" C<sub>A</sub> becomes **-l-**; it
takes the standalone Monadic Perspective form, which is **-l-**!

Here are some examples of conjugated Perspectives:

```cx table
alḑata
grove

alḑat⁴ra
⁴at least one ⁰grove

alḑat⁴wa
⁰groves ⁴in general

alḑat⁴ya
⁰grove⁴hood ⁰(⁴the quality of being ⁰a grove)


ulza¹f⁰a
¹set of different, connected ⁰rivers

ulza¹f⁴r⁰a
⁴one or more ¹sets of different, connected ⁰rivers

ulza¹f⁴w⁰a
¹sets of different, connected ⁰rivers ⁴in general

ulza¹f⁴y⁰a
⁴the quality of being ¹a set of different, connected ⁰rivers


eļmalí
I heard [somebody's] asleep.

eļma⁴r⁰í
I heard ⁴one or more ⁰instances of sleeping are occurring.

eļma⁴v⁰í
I heard sleeping ⁴happens in general⁰.

eļma⁴j⁰í
I heard ⁴the quality of sleeping ⁰exists.
```
