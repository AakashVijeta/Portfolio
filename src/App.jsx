import { useLayoutEffect } from 'react';
import { useLayoutMode } from './hooks/useLayoutMode';
import { SectionProvider } from './context/SectionContext';
import SectionManager from './components/SectionManager';
import ProjectOverlay from './components/ProjectOverlay';
import Preloader from './components/Preloader';
import BottomBar from './components/BottomBar';
import NavDots from './components/NavDots';
import CustomCursor from './components/CustomCursor';
import IntroSection from './components/sections/IntroSection';
import ProjectsSection from './components/sections/ProjectsSection';
import AboutSection from './components/sections/AboutSection';
import ContactSection from './components/sections/ContactSection';
import './App.css';

const SECTION_COMPONENTS = [
  IntroSection,
  ProjectsSection,
  AboutSection,
  ContactSection,
];

function App() {
  const mode = useLayoutMode();

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('is-flow', mode === 'flow');
  }, [mode]);

  return (
    <SectionProvider>
      <div className="App">
        <CustomCursor />
        <Preloader />
        <BottomBar />
        <NavDots />
        <SectionManager sections={SECTION_COMPONENTS} />
        <ProjectOverlay />
      </div>
    </SectionProvider>
  );
}

export default App;
