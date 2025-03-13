import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig, http, WagmiProvider } from 'wagmi'
import { base, baseGoerli } from 'wagmi/chains';
import { metaMask } from 'wagmi/connectors';
import Experience from "./pages/Experience"
// import ExperienceTheater from "./pages/ExperienceTheater"

const queryClient = new QueryClient();
const wagmiConfig = createConfig({
  chains: [base, baseGoerli],
  connectors: [metaMask()],
  transports: {
    [base.id]: http(),
    [baseGoerli.id]: http(),
  },
})

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
      {/* <ExperienceTheater /> */}
      <Experience />
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App