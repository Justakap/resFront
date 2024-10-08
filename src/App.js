import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './components/ResultAnalysis/Home';
import Disclaimer from './components/ResultAnalysis/Disclaimer'
import AddSubject from './components/ResultAnalysis/AddSubject';
import WhatsNew from './components/ResultAnalysis/WhatsNew';
import HomeNew from './components/ResultAnalysis/HomeNew';
// import runOneSignal from './OneSignal';
// import { useEffect } from 'react';



function App() {

  // useEffect(() => {
  //   runOneSignal()

  // }, [])


  return (
    <>

      <Router>
        {/* Home Route */}
        <Routes>
          <Route path='/' exact element={<>
            <Home></Home>
            {/* <HomeNew></HomeNew> */}
            
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
