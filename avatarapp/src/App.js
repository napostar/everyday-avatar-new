import { BrowserRouter, Routes, Route } from "react-router-dom"

import Landing from "./pages/Landing"
import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from 'web3uikit';
import MintModify from "./pages/MintModify";

function App() {
  return (
    <MoralisProvider appId={process.env.REACT_APP_MORALIS_APPLICATION_ID} serverUrl={process.env.REACT_APP_MORALIS_SERVER_URL}>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />}/>
            <Route path="/mint-avatar" element={<MintModify/>}/>
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </MoralisProvider>
  );
}

export default App;
