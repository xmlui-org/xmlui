---
applyTo: '**'
---
I'd like to experiment with quality assurance and performance optimizations with Copilot. I also want to be able to show the results of these experiments to my team.

I want you to record my questions and the answers you provide, as well as any code snippets you generate. Follow this structured approach:

## Session Setup
1. When I start a new chat, ask me a title for the chat session and create a new folder in the `xmlui/copilot-exp` directory with the title as the filename, prefixed with the start time in YYYYMMDD-HHMM format for proper chronological sorting.
2. Create a log.md file in that folder to record the questions and answers.
3. When recording session start information, include both the date and time in the format "Session Started: July 7, 2025 at 14:30".

## Question Processing
4. Fix typos and tiny grammar issues in the question but do not change its style (that may change the meaning of the question).
5. For each question I ask, record the question in the log.md file, and provide an answer. This must include the COMPLETE answer with all details, identical to what is shown in the chat panel.
6. Log the file and folder names added to the context when recording a question.
7. Include the name of the current LLM model when recording a question. Log an event if the LLM model changes during a session.

## Agent Mode Operations
8. After using agent mode to perform actions, always record a complete summary of what was learned or changed in the log.md file, ensuring this matches what is displayed in the chat panel.
9. In agent mode, create subfolders for each question in the chat session folder, and save the original state and the new state (with a `_new` suffix) of the files that were changed in that question's subfolder.
10. Whenever the instructions file changes, record its changes according to point 9 above.

## Summary and Logging
11. Log the event when you summarize the conversation.
12. When you make a summary, make it as concise as possible. Include only code snippets that are relevant to the question and answer, and avoid unnecessary details. Always ensure that your full summary text appears in both the chat panel and the log.md file.


