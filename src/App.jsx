import { SectionProvider } from './context/SectionContext';
import SectionManager from './components/SectionManager';
import ProjectOverlay from './components/ProjectOverlay';
import Preloader from './components/Preloader';
import StatusChrome from './components/StatusChrome';
import ThemeToggle from './components/ThemeToggle';
import IntroSection from './components/sections/IntroSection';
import ProjectsSection from './components/sections/ProjectsSection';
import AboutSection from './components/sections/AboutSection';
import ContactSection from './components/sections/ContactSection';
import CreditsSection from './components/sections/CreditsSection';
import './App.css';

const SECTION_COMPONENTS = [
  IntroSection,
  ProjectsSection,
  AboutSection,
  ContactSection,
  CreditsSection,
];

function App() {
  return (
    <SectionProvider>
      <div className="App">
        <Preloader />
        <StatusChrome />
        <ThemeToggle />
        <SectionManager sections={SECTION_COMPONENTS} />
        <ProjectOverlay />
      </div>
    </SectionProvider>
  );
}

export default App;
