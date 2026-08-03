import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';

export function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookmarks() {
      try {
        const res = await apiClient.get('/bookmarks');
        setBookmarks(Array.isArray(res) ? res : res?.bookmarks || []);
      } catch {
        setBookmarks([]);
      } finally {
        setLoading(false);
      }
    }
    loadBookmarks();
  }, []);

  if (loading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-display text-text-primary">Saved Hackathons</h1>

      {bookmarks.length === 0 ? (
        <EmptyState
          title="No bookmarks saved"
          description="Bookmark hackathons to save them for registration or updates."
          action={
            <Link to="/hackathons">
              <Button size="sm">Explore Hackathons</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookmarks.map((h) => (
            <Card key={h._id} className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge status={h.status} />
                <span className="text-xs text-text-secondary">{h.mode}</span>
              </div>
              <h3 className="text-base font-bold text-text-primary line-clamp-1">{h.title}</h3>
              <p className="text-xs text-text-secondary line-clamp-2">{h.description}</p>
              <div className="pt-2 border-t border-border-subtle">
                <Link to={`/hackathons/${h.slug}`}>
                  <Button size="sm" variant="secondary" className="w-full">
                    View Hackathon
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
