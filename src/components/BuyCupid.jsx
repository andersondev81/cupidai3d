import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";

const paymentTokens = ["ETH", "USDC", "DAI", "UCDT"];

export default function BuyCupid() {
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [purchaseToken, setPurchaseToken] = useState("ETH"); // Default to ETH
  const [amount, setAmount] = useState("");

  if (isConnected) {
    return (
      <div className="flex flex-col items-center w-full max-w-md p-6 rounded-2xl bg-white border border-gray-300 shadow-md">
        {/* Title */}
        <h1 className="text-xl font-semibold">Buy $CupidAI</h1>

        {/* Sell Section */}
        <div className="mt-6 w-full bg-gray-200 p-4 rounded-lg flex flex-col">
          <span className="text-gray-500 text-sm">Amount</span>
          <div className="flex justify-between items-center">
            <input
              autoFocus
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent text-gray-800 text-2xl outline-none w-full"
            />
            <select
              value={purchaseToken}
              onChange={(e) => setPurchaseToken(e.target.value)}
              className="bg-gray-300 text-gray-800 p-2 rounded-md"
            >
              {paymentTokens.map((token) => (
                <option key={token} value={token}>
                  {token}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Icon */}
        <div className="my-2 w-8 h-8 flex items-center justify-center bg-gray-300 rounded-full">
          ⬇
        </div>

        {/* Buy Section */}
        <div className="w-full bg-gray-200 p-4 rounded-lg flex flex-col">
          <span className="text-gray-500 text-sm">Buy</span>
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="0.00"
              className="bg-transparent text-gray-800 text-2xl outline-none w-full"
              disabled
            />
            <span className="bg-pink-500 text-white p-2 rounded-md">
              $CupidAI
            </span>
          </div>
        </div>

        {/* Buy Button */}
        <button className="mt-6 w-full bg-pink-500 hover:bg-pink-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md">
          Buy $CupidAI
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/20 backdrop-blur-2xl border border-white/30 shadow-2xl p-8 rounded-2xl text-center text-gray-800 w-full">
      <h1 className="text-3xl font-bold mb-4">$CupidAI Token 🚀</h1>
      <p className="text-lg mb-6">
        Transform your dating life forever with **$CupidAI**! Access:
      </p>
      <ul className="list-disc list-inside text-left mx-auto max-w-sm text-lg space-y-2">
        <li>💡 24/7 AI Dating Coach</li>
        <li>💬 AI Openers & Conversation Agent</li>
        <li>📸 Top-Tier AI-Generated Photos</li>
        <li>🎁 Rewards & Exclusive Marketplace</li>
      </ul>
      <p className="text-lg mt-6">
        **Join our Presale:**
        <br /> Connect Wallet → Buy $CupidAI with USDC → Unlock full access!
      </p>
    </div>
  );
}
