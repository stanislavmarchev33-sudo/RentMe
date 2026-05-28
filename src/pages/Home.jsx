import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import CategoriesSection from '@/components/home/CategoriesSection';
export default function Home() {
  return (
    <div className="bg-white">
      <div id="home-top"><HeroSection /></div>
      <div id="how-it-works"><CategoriesSection /></div>
    </div>
  );
}