# chrome_context_menu
multi-level right click context menu for chrome

Similar extensions exist.The ones I found were charging money for sub menus.

This was developed on openai chatGPT's free tier, i guess 4o.

its permissions are such because I plan on doing more with this.

Anways, to use it:

```
[
  ["root", "Search Engines", "", null],
  ["Search Engines", "Google", "https://www.google.com/search?q=TESTSEARCH", true],
  ["Search Engines", "DuckDuckGo", "https://duckduckgo.com/?q=TESTSEARCH", true],
  ["root", "", "", null],
  ["root", "Userstatus", "http://localhost:5000/endpoint?value=TESTSEARCH", false],
  ["root", "some Tools", "", null],
  ["some Tools", "Lookup id", "https://some.url.domain?value=TESTSEARCH", true],
  ["some Tools", "Lookup Email", "https://someother.url.domain?endpointname=blah&val=TESTSEARCH, true]
]
```