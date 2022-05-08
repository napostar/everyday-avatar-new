import { BrowserRouter, Routes, Route } from "react-router-dom"

import Landing from "./pages/Landing"
import { MoralisProvider } from "react-moralis";
import MintModify from "./pages/MintModify";

function App() {
  return (
    <MoralisProvider appId={process.env.REACT_APP_MORALIS_APPLICATION_ID} serverUrl={process.env.REACT_APP_MORALIS_SERVER_URL}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />}/>
            <Route path="/mint-avatar" element={<MintModify/>}/>
          </Routes>
        </BrowserRouter>
    </MoralisProvider>
  );
}

export default App;
