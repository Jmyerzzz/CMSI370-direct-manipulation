

## Jackson Myers

##### https://github.com/lmu-cmsi370-fall2017/direct-manipulation-Jmyerzzz.git

| | Feedback | Points | Notes |
| --- | --- | ---: | --- |
| **Bubble look (_3a_, _4a_, _4b_, _4d_)** | Completely B&W bubbles have some nice minimalism but…considering the range of possibilities, couldn’t they have been a _bit_ more? | 9 | A little too minimalist |
| **Bubble motion (_3a_, _3b_, _4a_, _4b_, _4d_)** | Motion is recognizably bubbly but shouldn’t bigger bubbles be more buoyant? | 28 | Feels odd to see large bubbles rise as quickly as tiny ones |
| **Bubble creation (_3a_, _3b_, _4a_, _4b_, _4d_)** | Works almost as specified, but when multiple bubbles are being drawn, the `anchor` variables are being overwritten so all bubbles share the same anchor. The reason for this is that the `anchor` values are stored with `touch.target`—but remember that `touch.target`, when drawing, is the _drawing area_—so the values are being overwritten at each `startDraw`. Also, there is a little glitch in the beginning: when the finger lands, a bubble of a certain size appears, but once the finger moves, the bubble “skips” to a new size based on the finger location. Resizing is then smooth from that point. | 16 | Concurrent multiple-bubble creation always uses the same `anchor` values; “skipping” glitch when initially resizing a newly-created bubble |
| **Bubble inflation/deflation (_3a_, _3b_, _4a_, _4b_, _4d_)** | The design of tapping to inflate by a bit, but then allowing unrestricted motion, is a good approach to allowing inflation while preserving the ability to move. It doesn’t _feel_ quite like inflation so there is some compromise, but as compromises go it isn’t too bad once learned. | 29 | Slight mental model dissonance on what “inflating” a bubble feels like |
| **Bubble popping/deletion (_3a_, _3b_, _4a_, _4b_, _4d_)** | Works as specified, although no feedback is given when a bubble is about to “pop.” A little signal that “one more click will end me” (red boundary? red color? throbbing animation?) would give the user a full picture of the state of things. | 8 | No feedback when close to popping |
| **Code Style (_4c_)** | Jenkins green |  |  |
| **Version Control (_4e_)** | 14 commits |  |  |
| **Punctuality (_4f_)** | on time |  |  |
|  |  | **90** | **Total** |
