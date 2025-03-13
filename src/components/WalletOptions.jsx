import { useConnect } from "wagmi";

export default function WalletOptions() {
  const { connectors, connect } = useConnect();

  return connectors.map((connector) => (
    <WalletOption
      key={connector.uid}
      connector={connector}
      onClick={() => connect({ connector })}
    />
  ));
}

function WalletOption({ connector, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 bg-white/80 border border-gray-300 text-gray-900 font-medium py-1 px-2 rounded-lg transition-all duration-200 hover:bg-white hover:shadow-md"
    >
      {connector.name}
    </button>
  );
}
