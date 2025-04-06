---
title: CA — Configuration
---

Ever thought about how strange it is that English has totally different words
for **forest**, **jungle**, **grove**, **wood**, and **orchard**, despite the
fact that they're basically variants of "group of trees"?

In Ithkuil, instead of memorizing these five words, we can just conjugate the
word **alḑala** (tree) to make them by using **Configuration**, the grammatical
category which makes pairs and groups of things.

Some examples before we get into conjugations:

```cx
alḑa¹l⁰a
tree

alḑa¹t⁰a
grove

alḑa¹f⁰a
jungle

alḑa¹z⁰a
forest
```

**Configuration** is really made up of three smaller categories, which combine
together in a sort of grid. Each category has three possible values:

@scrollable

<table>
  <thead>
    <tr>
      <th>Category</th>
      <th>Abbr.</th>
      <th>Name</th>
      <th>Meaning</th>
    </tr>
  </thead>
  <tbody class="last:*:*:whitespace-normal last:*:*:min-w-48">
    <tr>
      <td rowspan="3">Plexity</td>
      <td>U</td>
      <td>Uniplex</td>
      <td>just one thing</td>
    </tr>
    <tr>
      <td class="hidden"></td>
      <td>D</td>
      <td>Duplex</td>
      <td>a pair of things</td>
    </tr>
    <tr>
      <td class="hidden"></td>
      <td>M</td>
      <td>Multiplex</td>
      <td>a group of things</td>
    </tr>
    <tr>
      <td rowspan="3">Similarity</td>
      <td>S</td>
      <td>Similar</td>
      <td>the things are similar to each other</td>
    </tr>
    <tr>
      <td class="hidden"></td>
      <td>D</td>
      <td>Dissimilar</td>
      <td>the things are NOT similar to each other</td>
    </tr>
    <tr>
      <td class="hidden"></td>
      <td>F</td>
      <td>Fuzzy</td>
      <td>the similarity is unknown, unimportant, subjective, or not easy to define</td>
    </tr>
    <tr>
      <td rowspan="3">Separability</td>
      <td>S</td>
      <td>Separate</td>
      <td>the things are totally separate</td>
    </tr>
    <tr>
      <td class="hidden"></td>
      <td>C</td>
      <td>Connected</td>
      <td>the things are connected (but still have definable boundaries)</td>
    </tr>
    <tr>
      <td class="hidden"></td>
      <td>F</td>
      <td>Fused</td>
      <td>the things are fused (they have no easily definable boundaries)</td>
    </tr>
  </tbody>
</table>

This gives us twenty total Configurations, abbreviated as Plexity, then
Similarity, then Separability:

@scrollable

<table>
<tbody>
<tr>
<td colspan="3">UPX</td>
<td colspan="3">DPX</td>
</tr>
<tr>
<td>MSS</td>
<td>MSC</td>
<td>MSF</td>
<td>DSS</td>
<td>DSC</td>
<td>DSF</td>
</tr>
<tr>
<td>MDS</td>
<td>MDC</td>
<td>MDF</td>
<td>DDS</td>
<td>DDC</td>
<td>DDF</td>
</tr>
<tr>
<td>MFS</td>
<td>MFC</td>
<td>MFF</td>
<td>DFS</td>
<td>DFC</td>
<td>DFF</td>
</tr>
</tbody>
</table>

Notice **UPX** and **DPX** sitting at the top, alone. Why are they there?

- If Plexity is Uniplex, we're only talking about one thing, and it wouldn't
  make sense to also apply Similarity and Separability. Therefore, there is only
  one Configuration which uses Uniplex, and we abbreviate it **UPX**.
- **DPX** is there in case you want to use Duplex, but don't want to specify
  Similarity and Separability. There is no such equivalent for Multiplex, so you
  can't specify Multiplex without also specifying Similarity and Separability.

Now we can go back to the examples I put up before. Here's each one and its
corresponding Configuration:

| Word         | Meaning | @wrap Configuration                  | @wrap Reasoning                                                                                                                 |
| ------------ | ------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| @cx alḑa¹l⁰a | tree    | UPX (Uniplex)                        | it's only one tree                                                                                                              |
| @cx alḑa¹t⁰a | grove   | MSS (Multiplex-Similar-Separate)     | a grove is usually composed of similar trees, and they're typically not interconnected in any way                               |
| @cx alḑa¹f⁰a | jungle  | MDC (Multiplex-Dissimilar-Connected) | a jungle has many tree and plant types, and they're usually heavily connected (think: plants getting tangled around each other) |
| @cx alḑa¹z⁰a | forest  | MFS (Multiplex-Fuzzy-Separate)       | trees in a forest are usually neither as chaotically dissimilar nor as densely connected as a jungle                            |

Finally, let's see the conjugation tables for all Configurations. Note that the
first row is for plain UPX and DPX.

@scrollable

<table>
  <thead>
    <tr>
      <th>Similarity</th>
      <th>Separability</th>
      <th>U/M</th>
      <th>D</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td></td>
      <td>(plain UPX or DPX)</td>
      <td>—</td>
      <td>s</td>
    </tr>
    <tr>
      <td rowspan="3">S (Similar)</td>
      <td>S (Separate)</td>
      <td>t</td>
      <td>c</td>
    </tr>
    <tr>
      <td class="hidden"></td>
      <td>C (Connected)</td>
      <td>k</td>
      <td>ks</td>
    </tr>
    <tr>
      <td class="hidden"></td>
      <td>F (Fused)</td>
      <td>p</td>
      <td>ps</td>
    </tr>
    <tr>
      <td rowspan="3">D (Dissimilar)</td>
      <td>S (Separate)</td>
      <td>ţ</td>
      <td>ţs</td>
    </tr>
    <tr>
      <td class="hidden"></td>
      <td>C (Connected)</td>
      <td>f</td>
      <td>fs</td>
    </tr>
    <tr>
      <td class="hidden"></td>
      <td>F (Fused)</td>
      <td>ç</td>
      <td>š</td>
    </tr>
    <tr>
      <td rowspan="3">F (Fuzzy)</td>
      <td>S (Separate)</td>
      <td>z</td>
      <td>č</td>
    </tr>
    <tr>
      <td class="hidden"></td>
      <td>C (Connected)</td>
      <td>ž</td>
      <td>kš</td>
    </tr>
    <tr>
      <td class="hidden"></td>
      <td>F (Fused)</td>
      <td>ẓ</td>
      <td>pš</td>
    </tr>
  </thead>
</table>

@btw Why is the UPX conjugation listed as **—**? Since UPX is such a common
Configuration, it's actually not pronounced at all, so it's left empty in the
table. Then, you just need to remember that if the C<sub>A</sub> slot, which
Configuration is a part of, becomes **-l-** if nothing else is there.

To mark Configuration, replace the C<sub>A</sub> slot with the appropriate
consonant form from the table above:

```cx
azva¹l⁰a
a ¹single ⁰dog

azva¹s⁰a
a ¹pair of ⁰dogs

azva¹t⁰a
a ¹group of similar, separate ⁰dogs


aţla¹l⁰ó
They say a ¹single bird exists⁰.

aţla¹ç⁰ó
They say a ¹group of dissimilar, fused ⁰birds exists.
```

> @btw
>
> Configuration intuitively makes most sense for physical objects, but it can
> also apply to verbs, ideas, names, and more!
>
> For instance, you could apply MSF (Multiplex-Similar-Fused) Configuration on
> "to walk" to describe a painting where somebody appears to be walking in
> various directions at the same time, but you can't distinguish the various
> movements from each other.
>
> Or, you could use "brown"-DDC (Duplex-Dissimilar-Connected) to describe how
> the bark of a tree is made up of two very different browns.

Try coming up with Configurations to describe each of these phrases (book,
oxygen gas, etc.) in terms of its components (sheet of paper, oxygen atom,
etc.). For extra fun, also make the Ithkuil words for each one!

1. Turn **sheet of paper** (**@¹aḑgwala**) into **book**.
2. Turn **oxygen atom** (**@¹aňnala**) into **oxygen gas** (hint: oxygen gas is
   a molecule made of two oxygen atoms).
3. Turn **to vote** (**@¹urnyala**) into **to vote on several things**.
4. Turn **a coincidence** (**@¹orcala**) into **a series of coincidences**.
5. Turn **something retained from the past** (**@¹emzala**) into **an archive**.

> @details Answers and explanations
>
> 1. A book is made of many similar sheets of paper, and is bound into a single
>    book, with all individual pieces of paper easily distinguishable. As such,
>    MSC is probably most appropriate, which we conjugate as **aḑgwaka**.
> 2. Oxygen gas is made of a pair of practically identical, bonded oxygen atoms,
>    so we'll use DSC, making **aňnaksa**.
> 3. Voting on several things is essentially voting multiple times, likely
>    separately. Since we aren't told how similar the things we're voting on
>    are, I'll use Fuzzy Similarity. This makes MFS, giving us **urnyaza**.
> 4. A series of coincidences doesn't necessarily mean that the coincidences are
>    similar, but they are probably connected, since it's a series, so I'll use
>    MFC, making **orcaža**.
> 5. An archive is essentially a collection of things retained from the past.
>    Since an archive usually has lots of different things, Fuzzy is appropriate
>    here. Separate is also appropriate, since the archive typically does not
>    fuse its contents together. This gives us MFS, making **emzaza**.
