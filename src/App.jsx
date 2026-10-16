import { useLayoutEffect } from 'react';
import { useLayoutMode } from './hooks/useLayoutMode';
import { SectionProvider } from './context/SectionContext';
import SectionManager from './components/SectionManager';
import MobileFlow from './components/MobileFlow';
import CustomCursor from './components/CustomCursor';
import ProjectOverlay from './components/ProjectOverlay';
import ProjectViewer from './components/ProjectViewer';
import Preloader from './components/Preloader';
import NavDots from './components/NavDots';
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
        {mode === 'paged' && <NavDots />}
        {mode === 'paged'
          ? <SectionManager sections={SECTION_COMPONENTS} />
          : <MobileFlow sections={SECTION_COMPONENTS} />}
        {mode === 'paged' ? <ProjectOverlay /> : <ProjectViewer />}
      </div>
    </SectionProvider>
  );
}

export default App;
