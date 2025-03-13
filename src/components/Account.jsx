import { Check, Copy, LogOut } from "lucide-react";
import blockies from "ethereum-blockies-base64";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { useState } from "react";
import { formatEther } from "viem";

function shortenAddress(address, chars = 4) {
  if (!address) return "";
  if (address.length < 2 + chars * 2) return address; // Avoid shortening if it's too short
  return `${address.slice(0, 2 + chars)}...${address.slice(-chars)}`;
}

export default function Account() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data } = useBalance({ address });
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!address) return null;

  return (
    <div className="bg-white/40 backdrop-blur-2xl border border-white/50 shadow-xl p-3 rounded-2xl flex items-center gap-4 max-w-sm w-full flex-wrap gap-x-4 gap-y-0">
      {/* Avatar: ENS avatar or Identicon fallback */}
      <img
        src={blockies(address)}
        alt="Wallet Avatar"
        className="w-12 h-12 rounded-full"
      />

      {/* Address & Balance */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-gray-800 font-semibold text-sm">
            {shortenAddress(address)}
          </span>
          <button
            onClick={handleCopy}
            className={`p-1 rounded-full transition ${
              copied ? "text-green-700" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        {data && (
          <span className="text-xs text-gray-500">
            {formatEther(data.value)} {data.symbol}
          </span>
        )}
      </div>

      {/* Disconnect Button */}
      <button
        onClick={() => disconnect()}
        className="ml-auto bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md flex items-center gap-2 text-sm"
      >
        <LogOut size={16} />
        Disconnect
      </button>
    </div>
  );
}
