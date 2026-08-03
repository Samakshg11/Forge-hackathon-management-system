import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col justify-between selection:bg-accent-primary selection:text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 my-12">
        <Card className="max-w-md w-full p-8 text-center space-y-6 border border-border-subtle bg-surface shadow-xl">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent-primary">
              Error 404
            </span>
            <h1 className="text-3xl font-bold font-display text-text-primary">
              Page Not Found
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed">
              The path you requested does not exist or has been moved to another location.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full font-medium">
                <Home className="w-4 h-4 mr-2" /> Home
              </Button>
            </Link>
            <Link to="/app/dashboard" className="w-full sm:w-auto">
              <Button className="w-full font-medium">
                Dashboard <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            </Link>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

export default NotFoundPage;
