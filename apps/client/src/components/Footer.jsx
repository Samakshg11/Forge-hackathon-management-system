import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="w-full border-t border-border-subtle bg-canvas text-text-secondary text-xs py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-accent-primary text-white font-bold text-xs flex items-center justify-center">
            F
          </div>
          <span className="font-display font-bold text-text-primary uppercase tracking-wider">
            FORGE
          </span>
          <span>— Where ideas get built.</span>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/hackathons" className="hover:text-text-primary">
            Directory
          </Link>
          <a href="https://github.com/samakshgarg/Forge-capstone" target="_blank" rel="noreferrer" className="hover:text-text-primary">
            GitHub
          </a>
          <span className="text-text-secondary/50">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}
