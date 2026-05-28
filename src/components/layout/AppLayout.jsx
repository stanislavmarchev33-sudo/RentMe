import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function AppLayout() {
  const { pathname } = useLocation();
  const isChatPage = pathname.includes('/chat');

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className={`flex-1 pt-[68px] ${isChatPage ? 'pb-0' : 'pb-16 md:pb-0'}`}>
        <Outlet />
      </main>
      {!isChatPage && <Footer />}
    </div>
  );
}