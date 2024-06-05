import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './components/ResultAnalysis/Home';
import Disclaimer from './components/ResultAnalysis/Disclaimer'
import AddSubject from './components/ResultAnalysis/AddSubject';
import WhatsNew from './components/ResultAnalysis/WhatsNew';




function App() {


  return (
    <>

      <Router>
        {/* Home Route */}
        <Routes>
          <Route path='/' exact element={<>
            <Home></Home>
          </>}
          />
        </Routes>

        {/* // Result analysis */}
        <Routes>
          <Route path='/result' exact element={<>
            <Home></Home>          </>}
          />
        </Routes>

        <Routes>
          <Route path='/disclaimer' exact element={<>
            <Disclaimer></Disclaimer>
          </>}
          />
        </Routes>
        <Routes>
          <Route path='/whatsNew' exact element={<>
            <WhatsNew>
            </WhatsNew>          </>}
          />
        </Routes>
        <Routes>
          <Route path='/newSubject' exact element={<>
            <AddSubject></AddSubject>
          </>}
          />
        </Routes>
      </Router>

    </>
  );
}

export default App;
