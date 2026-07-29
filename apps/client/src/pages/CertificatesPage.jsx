import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { Award, ExternalLink } from 'lucide-react';

export function CertificatesPage() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCerts() {
      try {
        const res = await apiClient.get('/certificates/mine');
        setCerts(res.data);
      } catch {
        setCerts([]);
      } finally {
        setLoading(false);
      }
    }
    loadCerts();
  }, []);

  if (loading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-display text-text-primary">My Certificates</h1>

      {certs.length === 0 ? (
        <EmptyState
          title="No certificates earned yet"
          description="Complete hackathons and participate with a team to earn verified certificates."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certs.map((cert) => (
            <Card key={cert._id} className="space-y-4 border-accent-primary/20">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-accent-primary/10 text-accent-primary border border-accent-primary/30">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">
                    {cert.hackathonId?.title || 'Hackathon Certificate'}
                  </h3>
                  <p className="text-xs font-mono text-text-secondary">Code: {cert.verificationCode}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border-subtle text-xs text-text-secondary">
                <span>Rank Achieved: #{cert.rank || 'Participant'}</span>
                <a
                  href={`/api/v1/certificates/verify/${cert.verificationCode}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent-secondary flex items-center gap-1 hover:underline font-medium"
                >
                  Verify <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
