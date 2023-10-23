import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./App.css";
import { UploadTranscribe } from "./assets/components";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadTranscribe />}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
