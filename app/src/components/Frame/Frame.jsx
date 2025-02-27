import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Container, Sidebar, Sidenav, Content, Nav, DOMHelper } from 'rsuite';
import { Outlet } from 'react-router-dom';
import NavToggle from './NavToggle';
import Header from '../Header';
import NavLink from '../NavLink';
import Brand from '../Brand';

const { getHeight, on } = DOMHelper;

const NavItem = props => {
  const { title, eventKey, ...rest } = props;
  return (
    <Nav.Item eventKey={eventKey} as={NavLink} {...rest}>
      {title}
    </Nav.Item>
  );
};

const Frame = (props) => {
  const { navs } = props;
  const [expand, setExpand] = useState(true);
  const [hoverExpand, setHoverExpand] = useState(false);
  const [windowHeight, setWindowHeight] = useState(getHeight(window));

  useEffect(() => {
    setWindowHeight(getHeight(window));
    const resizeListenner = on(window, 'resize', () => setWindowHeight(getHeight(window)));

    return () => {
      resizeListenner.off();
    };
  }, []);

  const handleMouseEnter = () => {
    if (!expand) setHoverExpand(true);
  };

  const handleMouseLeave = () => {
    if (!expand) setHoverExpand(false);
  };

  const containerClasses = classNames('page-container', {
    'container-full': !expand
  });

  const navBodyStyle = expand || hoverExpand
    ? { height: 'calc(100vh - 112px)', overflow: 'auto' }
    : {};

  return (
    <Container className="frame" style={{ height: '100vh', overflow: 'hidden', display: 'flex' }}>
      <Sidebar
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100vh', 
          transition: 'width 0.3s', 
          borderRight: hoverExpand ? '0.1px solid #ddd' : 'none',
          overflow: 'hidden',
          zIndex: 1000
        }}
        width={expand || hoverExpand ? 260 : 56}
        collapsible
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Sidenav.Header>
          <Brand />
        </Sidenav.Header>
        <Sidenav expanded={expand || hoverExpand} appearance="subtle" defaultOpenKeys={['2', '3']}>
          <Sidenav.Body style={navBodyStyle}>
            <Nav>
              {navs.map(item => {
                const { children, ...rest } = item;
                if (children) {
                  return (
                    <Nav.Menu key={item.eventKey} placement="rightStart" trigger="hover" {...rest}>
                      {children.map(child => {
                        return <NavItem key={child.eventKey} {...child} />;
                      })}
                    </Nav.Menu>
                  );
                }
                if (rest.target === '_blank') {
                  return (
                    <Nav.Item key={item.eventKey} {...rest}>
                      {item.title}
                    </Nav.Item>
                  );
                }
                return <NavItem key={rest.eventKey} {...rest} />;
              })}
            </Nav>
          </Sidenav.Body>
        </Sidenav>
        <NavToggle expand={expand} onChange={() => setExpand(!expand)} />
      </Sidebar>

      <Container className={containerClasses} style={{ height: '100vh', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Content style={{ flex: 1, overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Container>
    </Container>
  );
};

export default Frame;
