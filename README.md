# Description

This is a simple tool leveraging the power of the new OpenAI v2 API which uses Assistants, Threads, Runs and Messages for document looking.

The user can ask questions to the desired model and get answers in real-time.

# Pre-requisites

- OpenAI API key
- credits in your OpenAI account
- one assistant created
- one thread created tied with that assistant
- Tampermonkey extension installed in your browser

# Getting started

1. Install Tampermonkey from [here](https://www.tampermonkey.net/).
2. Add a new user script in the dashboard.
3. Paste the content of the `openai.js` file in the editor.
4. Fill in the `API_KEY`, `ASSISTANT_ID` and `THREAD_ID` variables with your own values.
5. Assure that the script is set to `Run at: Default`.
6. Save the script.
7. Enter any website and press `Ctrl + Shift + H` to activate the script.
8. Ask questions to the model and press the `Send` button. Wait for the answer to appear under the text area!

# Credits

- [snaake20](https://github.com/snaake20) for coming up with the idea of the original script.
- [OpenAI](https://openai.com) for providing the API.
- [Tampermonkey](https://www.tampermonkey.net/) for providing the browser extension.
- [GitHub](https://github.com) for hosting this repository.
