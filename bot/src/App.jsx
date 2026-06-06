import React, { useState } from 'react';
import { HarmonicDensity } from './components/HarmonicDensity';
import { UIControls } from './components/UIControls';
import { useTheme } from './hooks/useTheme';
import './App.css';

function App() {
  const theme = useTheme();
  const [isGlass, setIsGlass] = useState(true);
  const [isCoreVisible, setIsCoreVisible] = useState(true);
  const [ignition, setIgnition] = useState(0);
  const [introActive, setIntroActive] = useState(true);

  return (
    <div className="App">
      <HarmonicDensity 
        theme={theme}
        isGlass={isGlass}
        isCoreVisible={isCoreVisible}
        ignition={ignition}
        setIntroActive={setIntroActive}
      />
      <UIControls 
        theme={theme}
        isGlass={isGlass}
        setIsGlass={setIsGlass}
        isCoreVisible={isCoreVisible}
        setIsCoreVisible={setIsCoreVisible}
        ignition={ignition}
        setIgnition={setIgnition}
        introActive={introActive}
      />
    </div>
  );
}

export default App;
