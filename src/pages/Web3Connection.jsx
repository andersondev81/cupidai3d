import BuyCupid from "../components/BuyCupid";
import { ConnectWallet } from "../components/ConnectWallet";
import { motion } from "framer-motion";

export default function Web3Connection({ onBack, onLearnMore }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex bg-gradient-to-t from-[#d9afd9] to-[#97d9e1] items-center justify-center min-h-screen w-full pointer-events-auto"
    >
      <div className="grid grid-cols-3 gap-3 w-full px-2 items-start place-items-center">
        <div className="flex flex-col gap-14 justify-center max-w-xs">
          <button
            onClick={onBack}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md"
          >
            Back
          </button>
          <button
            onClick={onLearnMore}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md"
          >
            Learn More
          </button>
        </div>

        <BuyCupid />
        <ConnectWallet />
      </div>
    </motion.div>
  );
}
