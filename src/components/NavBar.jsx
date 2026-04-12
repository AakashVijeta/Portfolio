import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import "../styles/NavBar.css";

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Navbar fixed="top" className={scrolled ? "is-scrolled" : ""}>
      <Container>
        <Navbar.Brand href="#" id="brand">Aakash Vijeta</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#intro">Home</Nav.Link>
            <Nav.Link href="#about">About</Nav.Link>
            {/* <Nav.Link href="#experience">Experience</Nav.Link> */}
            <Nav.Link href="#projects">Projects</Nav.Link>
          </Nav>

          <Nav className="ml-auto">
            <Nav.Link href="mailto:aakashvijeta2@gmail.com">
              <EmailRoundedIcon style={{ fontSize: 20 }} />
            </Nav.Link>

            <Nav.Link
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubIcon style={{ fontSize: 19 }} />
            </Nav.Link>

            <Nav.Link
              href="https://www.linkedin.com/in/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkedInIcon style={{ fontSize: 21 }} />
            </Nav.Link>

            {/* {/* <Nav.Link
              href="https://medium.com/"
              target="_blank"
              rel="noopener noreferrer"
            > */}
              {/* <BorderColorIcon style={{ fontSize: 20 }} />
            </Nav.Link> */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
