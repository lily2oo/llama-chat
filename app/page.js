"use client";

import { useEffect, useRef, useState } from "react";
import ChatForm from "./components/ChatForm";
import Message from "./components/Message";
import { useCompletion } from "ai/react";
import { Llama3Template } from "../src/prompt_template";

const llama3Template = Llama3Template();

const generatePrompt = (template, systemPrompt, messages) => {
  const chat = messages.map((message) => ({
    content: message.text,
  }));

  return template([
    {
      role: "system",
      content: systemPrompt,
    },
    ...chat,
  ]);
};

export default function HomePage() {
  const bottomRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);

  //   Llama params
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful assistant."
  );

  const { complete, completion, setInput, input } = useCompletion({
    api: "/api",
    body: {
      systemPrompt: systemPrompt,
    },

    onError: (error) => {
      setError(error);
    },
  });

  const handleSubmit = async (userMessage) => {
    const messageHistory = [...messages];
    if (completion.length > 0) {
      messageHistory.push({
        text: completion,
        isUser: false,
      });
    }
    messageHistory.push({
      text: userMessage,
      isUser: true,
    });

    // Generate initial prompt and calculate tokens
    let prompt = `${generatePrompt(
      llama3Template,
      systemPrompt,
      messageHistory
    )}\n`;

    setMessages(messageHistory);

    complete(prompt);
  };

  useEffect(() => {
    if (messages?.length > 0 || completion?.length > 0) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, completion]);

  return (
    <>
      <main className="max-w-2xl pb-5 mx-auto mt-8 sm:px-4">
        <div className="text-center"></div>

        <ChatForm prompt={input} setPrompt={setInput} onSubmit={handleSubmit} />

        {error && <div>{error}</div>}

        <article className="pb-24">
          {messages.map((message, index) => (
            <Message
              key={`message-${index}`}
              message={message.text}
              isUser={message.isUser}
            />
          ))}
          <Message message={completion} isUser={false} />

          <div ref={bottomRef} />
        </article>
      </main>
    </>
  );
}
