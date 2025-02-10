import Head from "next/head";
import Chatbot from "@/components/chatbot";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <Head>
        <title>Next.js AI Chatbot</title>
      </Head>
      <h1 className="text-3xl font-bold mb-4">Next.js AI Chatbot</h1>
      <Chatbot />
    </div>
  );
}
