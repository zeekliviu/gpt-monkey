// ==UserScript==
// @name         GPT API
// @namespace    http://tampermonkey.net/
// @version      2024-06-10
// @description  select the text you want to send to the assistant and press Shift + Ctrl + H
// @author       Zeek Liviu (@zeekliviu), based on the work of @snaake20
// @match        https://*/*
// ==/UserScript==

(function () {
  "use strict";

  const API_ROOT = "https://api.openai.com/v1";
  const API_KEY = "<YOUR_API_KEY_HERE>";
  const THREAD_ID = "<YOUR_THREAD_ID_HERE>";
  const MESSAGES_ROUTE = `threads/${THREAD_ID}/messages`;
  const RUNS_ROUTE = `threads/${THREAD_ID}/runs`;
  const ASSISTANT_ID = "<YOUR_ASSISTANT_ID_HERE>";
  const POLLING_INTERVAL = 1000;

  const headers = new Headers({
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
    "OpenAI-Beta": "assistants=v2",
  });

  const getAnswer = async () => {
    try {
      const url = new URL(`${API_ROOT}/${MESSAGES_ROUTE}`);
      url.searchParams.append("limit", 1);
      const res = await fetch(url, {
        method: "GET",
        headers,
      });
      if (res.status === 200) {
        const data = await res.json();
        return data.data[0].content[0].text.value;
      }
      return "N-ai primit răspuns!";
    } catch (error) {
      return "N-ai primit răspuns!";
    }
  };

  const postQuestion = async (question) => {
    try {
      const url = new URL(`${API_ROOT}/${MESSAGES_ROUTE}`);
      const body = JSON.stringify({
        content: question,
        role: "user",
      });

      const res = await fetch(url, {
        method: "POST",
        headers,
        body,
      });

      if (res.status === 200) {
        return await createRunAndWaitToComplete();
      }
      return "Eroare la postarea întrebării!";
    } catch (error) {
      return "Eroare la postarea întrebării!";
    }
  };

  const createRunAndWaitToComplete = async () => {
    try {
      const url = new URL(`${API_ROOT}/${RUNS_ROUTE}`);
      const body = JSON.stringify({
        assistant_id: ASSISTANT_ID,
        tools: [
          {
            type: "file_search",
          },
        ],
      });

      const res = await fetch(url, {
        method: "POST",
        headers,
        body,
      });

      if (res.status === 200) {
        const data = await res.json();
        return await waitToComplete(data.id);
      }
    } catch (error) {
      return "Eroare la crearea rulării!";
    }
  };

  const waitToComplete = async (runId) => {
    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const url = new URL(`${API_ROOT}/${RUNS_ROUTE}/${runId}`);
          const res = await fetch(url, {
            method: "GET",
            headers,
          });

          if (res.status === 200) {
            const data = await res.json();
            if (["queued", "in_progress"].includes(data.status)) {
              setTimeout(checkStatus, POLLING_INTERVAL);
            } else if (data.status === "failed") {
              resolve("Rularea a eșuat!");
            } else {
              const answer = await getAnswer();
              resolve(answer);
            }
          } else {
            setTimeout(checkStatus, POLLING_INTERVAL);
          }
        } catch (error) {
          reject("Eroare la așteptarea completării!");
        }
      };

      checkStatus();
    });
  };

  const body = document.body;
  const userPrompt = window.getSelection().toString();
  const div = document.createElement("div");
  div.style.position = "fixed";
  div.style.top = "0";
  div.style.left = "0";
  div.style.width = "100%";
  div.style.height = "100%";
  div.style.overflowY = "auto";
  div.style.zIndex = "9999";
  div.innerHTML = `
    <div id="modal" style="background-color: white; padding: 20px; border-radius: 10px; position: relative; width: 35%; height: 35%; margin:25px 25px; overflow-y: auto;">
        <div style="width: 100%; display:flex; gap: 10px;">
            <textarea id="prompt" style="width: 100%" value="${userPrompt}">${userPrompt}</textarea>
            <button id="send-request">Send</button>
        </div>
        <p id="response"></p>
    </div>
    `;
  const modal = div.querySelector("#modal");
  const question = div.querySelector("#prompt");
  const sendRequestButton = div.querySelector("#send-request");
  const response = div.querySelector("#response");

  sendRequestButton.onclick = async () => {
    if (!question.value) {
      response.textContent = "Introdu o intrebare";
      setTimeout(() => {
        response.textContent = "";
      }, 3000);
      return;
    }
    response.textContent = "Așteaptă...";
    response.textContent = await postQuestion(question.value);
  };

  div.onclick = (e) => {
    if (
      e.target !== modal &&
      e.target !== question &&
      e.target !== sendRequestButton &&
      e.target !== response
    ) {
      div.remove();
    }
  };

  body.onkeydown = (e) => {
    if (e.key === "Escape") {
      div.remove();
    }
  };

  body.onkeydown = (e) => {
    if (e.shiftKey && e.ctrlKey && e.key === "H") {
      body.appendChild(div);
    }
  };
})();
