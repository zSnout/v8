---
title: Debug Utilities
open: false
tag: btw
---

<p><button id='sizes-btn' class='font-bold underline text-z-heading'>Click
here</button> to compute the size and approximate word count of each section.
Note that the size is computed as the height in pixels of the section, so it
depends on your screen's width.</p>

Once the table is generated, you can click the **Words** and **Size** columns to
sort by their values.

<table class='*:*:*:text-right last:*:*:*:text-left hidden'>
  <thead>
    <tr>
      <th id='sizes-words'><button>Words</button></th>
      <th id='sizes-size'><button>Size</button></th>
      <th>Section</th>
    </tr>
  </thead>
  <tbody id='sizes' class='*:*:font-mono last:*:*:font-sans last:*:*:font-semibold last:*:*:text-z-heading'>
  </tbody>
</table>

<script>
  const article = document.querySelector('article')
  const sections = [...article.children].filter(x => x.tagName == 'DETAILS')
  const btn = document.getElementById('sizes-btn')
  const ret = document.getElementById('sizes')
  btn.addEventListener('click', () => {
    ret.parentElement.classList.remove('hidden')
    while (ret.firstChild) {
      ret.firstChild.remove()
    }
    const len = (x) => x.match(/\S+/g)?.length || 0
    sections.forEach(x => {
      const isOpen = x.open
      x.open = true
      const section = x.querySelector('summary').textContent
      const size = x.clientHeight + 'px'
      const tr = document.createElement('tr')
      const td3 = document.createElement('td')
      td3.textContent = len(x.innerText)
      const td1 = document.createElement('td')
      td1.textContent = section
      const td2 = document.createElement('td')
      td2.textContent = size
      tr.appendChild(td3)
      tr.appendChild(td2)
      tr.appendChild(td1)
      ret.appendChild(tr)
      x.open = isOpen
    })
  })
  document.getElementById('sizes-words').addEventListener('click', () => {
    const trs = [...ret.children]
    trs.forEach(x => x.remove())
    trs.sort((a, b) => +b.children[0].textContent - +a.children[0].textContent)
    trs.forEach(x => ret.appendChild(x))
  })
  document.getElementById('sizes-size').addEventListener('click', () => {
    const trs = [...ret.children]
    trs.forEach(x => x.remove())
    trs.sort((a, b) => +b.children[1].textContent.slice(0, -2) - +a.children[1].textContent.slice(0, -2))
    trs.forEach(x => ret.appendChild(x))
  })
</script>
