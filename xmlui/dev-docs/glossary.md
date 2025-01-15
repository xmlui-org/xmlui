# Glossary of Terms

This article contains a glossary of terms used within xmlui. Understanding them can help you grasp the details of the framework's core and contribute to its development.

## Action

An action is a kind of side activity running asynchronously, such as data fetching, in-app navigation, file uploading, etc. After the action starts, it will eventually be complete, but we cannot know in advance when it will be finished. An action can change the state of the container it lives within, which can influence the behavior of the app.

## Layout Properties

Components may declare layout properties, such as `width`, `height`, `color`, and others. These properties directly set the component's corresponding style (if the component supports that particular setting). The rendering engine extracts most of these layout properties into a`React.CSSProperties` object that can be directly used as a React component's `style` property.