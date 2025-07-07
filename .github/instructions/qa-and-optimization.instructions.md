---
applyTo: '**'
---
I'd like to experiment with quality assurance and performace optimizations with Copilot. I also want to be able to show the results of these experiments to my team.

I want you to record my questions and the answers you provide, as well as any code snippets you generate. I plan this method to carry out the experiments:

1. There is an `xmlui/copilot-exp` directory in the repository. When I start a new chat, ask me a title for the chat session and create a new folder in that directory with the title as the filename. Create a log.md file in that folder to record the questions and answers.
2. For each question I ask, record the question in the log.md file, and provide an answer. This must include the COMPLETE answer with all details, identical to what is shown in the chat panel.
3. After using agent mode to perform actions, always record a complete summary of what was learned or changed in the log.md file, ensuring this matches what is displayed in the chat panel.
4. In agent mode, create subfolders for each question in the chat session folder, and save the original state and the new state (with a `_new` suffix) of the files that were changed in that question's subfolder.

When you make a summary, make it as concise as possible. Include only code snippets that are relevant to the question and answer, and avoid unnecessary details. Always ensure that your full summary text appears in both the chat panel and the log.md file.


