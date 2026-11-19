---
"xmlui": patch
---

With `xsVerbose` on, the trace buffer (`window._xsLogs`) stays bounded in a long-lived app. The kinds kept for interaction replay (interactions, API calls, handlers, navigation and the like) used to be exempt from `xsVerboseLogMax`, so the buffer grew for the app's whole life; they now have their own bound of 10 × `xsVerboseLogMax`. Trimming runs once per batch, down to 90% of a bound, in one pass with no sort, instead of re-sorting the whole buffer on every push past the cap.
