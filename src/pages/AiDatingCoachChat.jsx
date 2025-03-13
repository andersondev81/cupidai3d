import { useState } from "react";
import { ArrowLeft, Send, Smile, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import WalletOptions from "../components/WalletOptions";

export default function ChatInterface({ onBack }) {
  const [messages, setMessages] = useState([
    { text: "Hey there! How can I help you? 😊", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [remainingMessages, setRemainingMessages] = useState(5); // User starts with 5 messages
  const { isConnected } = useAccount();

  const sendMessage = () => {
    if (!input.trim() || remainingMessages <= 0) return;

    const userMessage = { text: input, sender: "user" };
    setMessages([...messages, userMessage]);

    // Simulate bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text: "That's interesting! Tell me more. 🤖", sender: "bot" },
      ]);
    }, 1000);

    setInput("");
    setRemainingMessages((prev) => prev - 1);
  };

  const buyMoreMessages = () => {
    setRemainingMessages((prev) => prev + 10); // Add 10 messages when buying
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-t from-[#d9afd9] to-[#97d9e1] p-4 pointer-events-auto"
    >
      <div className="w-full max-w-lg h-[80vh] flex flex-col bg-white/30 backdrop-blur-lg border border-white/40 shadow-2xl rounded-2xl relative">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-3 left-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full p-2 shadow-md transition"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Chat Header */}
        <div className="text-center text-gray-900 font-semibold text-xl border-b border-white/40 py-4">
          💬 CupidAI Dating Coach
        </div>

        {isConnected ? (
          <>
            {/* Message Quota & Buy More Button */}
            <div className="flex justify-between items-center px-4 py-2 text-sm bg-white/40 backdrop-blur-md border-b border-white/40">
              <span className="text-gray-800">
                💬 Messages Left: <strong>{remainingMessages}</strong>
              </span>
              <button
                onClick={buyMoreMessages}
                className="flex items-center gap-1 bg-pink-500 hover:bg-pink-400 text-white px-3 py-1 rounded-lg shadow-md text-xs transition"
              >
                <ShoppingCart size={16} />
                Buy More
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 p-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2 max-w-[75%] text-sm rounded-lg ${
                      msg.sender === "user"
                        ? "bg-pink-500 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Box */}
            <div className="border-t border-white/40 flex items-center p-2 bg-white/40 backdrop-blur-lg rounded-br-2xl rounded-bl-2xl">
              <button className="text-gray-700 hover:text-gray-900 p-2">
                <Smile size={24} />
              </button>
              <input
                type="text"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  remainingMessages > 0
                    ? "Type a message..."
                    : "No messages left. Buy more!"
                }
                className="flex-1 bg-transparent text-gray-900 outline-none px-3 py-2"
                disabled={remainingMessages <= 0}
              />
              <button
                onClick={sendMessage}
                className={`px-4 py-2 shadow-md transition ${
                  remainingMessages > 0
                    ? "bg-pink-500 text-white hover:bg-pink-400"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed hover:bg-gray-400"
                }`}
                disabled={remainingMessages <= 0}
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-4 h-full mx-6">
            {/* Message prompting the user to connect */}
            <p className="text-gray-800 text-sm font-medium">
              🔗 Connect your wallet to start chatting!
            </p>

            {/* Wallet Options */}
            <div className="flex flex-col items-center gap-4">
              <WalletOptions />
            </div>
          </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
