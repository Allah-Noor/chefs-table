import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Layout Component
 * Acts as the main application shell.
 * It renders the persistent Navbar and Footer, while the Outlet
 * displays the dynamic content based on the current route.
 */
const Layout = () => {
  return (
    // Flex container with min-h-screen creates a "sticky footer" layout
    // ensuring the footer stays at the bottom even with sparse content.
    <div className="flex flex-col min-h-screen font-sans bg-gray-50 text-gray-900">
      <Navbar />
      
      {/* Main content area expands (grow) to fill available vertical space */}
      <main className="grow">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;