On April 13, 2026, Jon walked Chuck — a capable developer who'd watch Jon build v1 of the WFHB moderation app (https://github.com/judell/wfhb) in 2 hours - through setup of the same Claude Code + XMLUI development environment that he saw Jon use. It took over 40 minutes of painstaking, error-prone work, with Jon's coaching, to get Chuck to the point where he had the same setup on his machine:

1. Claude Code running in a terminal
2. The XMLUI MCP server configured so Claude can consult component docs, examples, and how-tos
3. The trace viewer installed so he can export app traces for Claude to diagnose
4. A local dev server running the WFHB app
5. A side-by-side layout: Claude Code on the left, live app on the right

This is the baseline development experience. Without all five pieces, you can't productively build XMLUI apps with Claude.

Here is how it went.

**Install the XMLUI CLI (~10 min)**

Chuck asked Claude Code to help, but Claude didn't know what the XMLUI CLI was. Jon had to:

- Text Chuck the URL to the CLI download page
- Tell Chuck to paste the URL into Claude Code
- Chuck ran the curl/tar command *inside* Claude Code's dialog instead of in a separate terminal tab — a natural mistake that Jon had internalized so deeply he forgot to mention it
- Once in the right tab, the install worked, but required copying output back and forth between tabs for Claude to verify

**Configure the MCP server (~15 min)**

This was the worst part. The XMLUI MCP server is embedded in the CLI that was just installed, but Claude Code needs a JSON configuration entry to know about it. This required:

- Jon texting Chuck the exact configuration to paste
- Claude Code suggesting wrong approaches (trying to install something new instead of configuring what was already there)
- Multiple rounds of "say no" / "say yes" to Claude's suggestions
- A JSON configuration error that Claude then had to diagnose and fix
- A full restart of Claude Code for the MCP server to become available
- Verification that the MCP tools actually appeared

**Install the trace viewer (~10 min)**

Yet another URL to text, another set of instructions for Claude to follow, another component (the Inspector) that needed to be added. Jon had to correct Claude's interpretation of the instructions in real time.

**Start a local dev server (~5 min)**

Chuck had previously been opening `index.html` directly in the browser (via `file://`), which doesn't work for this app. Jon had to suggest `python3 -m http.server` and Chuck had to try `python` vs `python3` before it worked.

**Total elapsed time: ~40 minutes**

## What went wrong, and why it matters

None of the individual steps were hard. The problem was that there were separate things to install and configure, each with its own failure modes, and no integrated path through them.

At the end Chuck said: *"You need to go through all these things that nobody would know. Once you get to here, it will be smooth sailing."*

He's right. Once everything was wired up, Chuck changed a button color in seconds by talking to Claude. The development experience is transformative — but only if you can get there. Every bit setup of friction works against us. 

Chuck is the one person on planet Earth who I can say for sure plans to solve a business problem with XMLUI. He is highly motivated to do it. Now that he has the setup I showed him when we built v1 of the moderator app, https://github.com/judell/wfhb, we are ready to proceed with implementing the final acceptance criterion: https://gist.github.com/judell/8c8678b90b3ab199360fc967a2728f67. We'll do it on another call, and I am confident we'll succeed, and that Chuck will be able to do his part of it independently.

To get to that point required somebody as motivated as Chuck to slog through the setup, and was only then possible because I was there to help. 

The [XMLUI IDE proposal](https://gist.github.com/judell/cc43f2eed989b77eff33c6f58c26e977) describes a VS Code extension that bundles all of this into a single coherent experience: terminal with Claude Code, live preview panel, trace viewer panel, and pre-configured MCP server. One install, zero configuration, immediate productivity. It is not the only way to crack this nut, if we can bring the ingredients together in a different/better way then do it.

But let's do it soon. The 40 minutes Chuck spent should be 2 minutes. That's the gap we need to close. So long as we don't, the only ones who experience the transformative power of XMLUI will be us, and not for long.

<hr/>

Note: I assume Claude Code and VSCode here because it is dominant the way VSCode is. There are other command line agents, other IDEs, but this combo will serve the widest possible initial group.