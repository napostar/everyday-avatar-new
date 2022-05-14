import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import { MoralisProvider } from "react-moralis";
import MintModify from "./pages/MintModify";
import UpdateAvatar from "./pages/UpdateAvatar";
import NftsContext from "./context/NftsContext";

function App() {
  return (
    <MoralisProvider
      appId={process.env.REACT_APP_MORALIS_APPLICATION_ID}
      serverUrl={process.env.REACT_APP_MORALIS_SERVER_URL}
    >
      <NftsContext>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/mint-avatar" element={<MintModify />} />
            <Route path="/view-update/:tokenId" element={<UpdateAvatar />} />
          </Routes>
        </BrowserRouter>
      </NftsContext>
    </MoralisProvider>
  );
}

export default App;
