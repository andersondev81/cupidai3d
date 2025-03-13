import { useAccount } from "wagmi";
import Account from "./Account";
import WalletOptions from "./WalletOptions";

export function ConnectWallet() {
  const { isConnected } = useAccount();

  if (isConnected) return <Account />;

  return (
    <div className="flex flex-col gap-14 max-w-xs">
      <WalletOptions />
    </div>
  );
}
