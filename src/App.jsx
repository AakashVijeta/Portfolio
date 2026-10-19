import { useLayoutEffect } from 'react';
import { useLayoutMode } from './hooks/useLayoutMode';
import { SectionProvider } from './context/SectionContext';
import ScrollFlow from './components/ScrollFlow';
import CustomCursor from './components/CustomCursor';
import ProjectViewer from './components/ProjectViewer';
import Preloader from './components/Preloader';
import NavDots from './components/NavDots';
import Viewfinder from './components/Viewfinder';
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

  // The page always scrolls; is-flow marks the scroll layout (mobile.css / desktop.css
  // choose the design by viewport width)
  useLayoutEffect(() => {
    document.documentElement.classList.add('is-flow');
  }, []);

  return (
    <SectionProvider>
      <div className="App">
        <CustomCursor />
        <Preloader />
        {mode === 'paged' && <NavDots />}
        {mode === 'paged' && <Viewfinder />}
        <ScrollFlow sections={SECTION_COMPONENTS} />
        <ProjectViewer />
      </div>
    </SectionProvider>
  );
}

export default App;
