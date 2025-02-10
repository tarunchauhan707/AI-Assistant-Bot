"use client";
import { useState, useRef } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();
      const botMessage = { role: "assistant", content: data.message };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
    }

    setLoading(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col items-center p-4 max-w-xl mx-auto">
      <Card className="w-full p-4 mb-4">
        <CardBody className="space-y-4 flex flex-col">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-xs whitespace-pre-line ${
                msg.role === "user"
                  ? "bg-blue-500 text-white self-end ml-auto"
                  : "bg-gray-300 text-black self-start"
              }`}
            >
              <strong>{msg.role === "user" ? "You:" : "AI:"}</strong>{" "}
              <span dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, "<br />") }} />
            </div>
          ))}
        </CardBody>
      </Card>
      <div className="flex items-center mx-4 w-full gap-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
          fullWidth
        />
        <Button onPress={sendMessage} color="secondary" isLoading={loading}>
          Send
        </Button>
      </div>
    </div>
  );
}
