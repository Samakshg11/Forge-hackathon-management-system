import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useToast } from '../components/ui/Toast';
import { Card } from '../components/ui/Card';
import { Input, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { HACKATHON_THEMES, validateHackathonDates } from '@forge/shared';
import { Check, ArrowRight, ArrowLeft, Plus, Trash2 } from 'lucide-react';

export function HackathonWizardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(Boolean(id));

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    theme: ['AI/ML'],
    mode: 'online',
    venue: '',
    bannerUrl: '',
    registrationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    submissionStart: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    submissionDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    reviewDeadline: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    prizePool: '$50,000 USD',
    maxTeamSize: 4,
    rules: '',
    judgingCriteria: [
      { name: 'innovation', description: 'Originality of concept', maxScore: 10, weight: 1 },
      { name: 'technicalComplexity', description: 'Architecture depth', maxScore: 10, weight: 1 },
      { name: 'ui', description: 'Design quality', maxScore: 10, weight: 1 },
      { name: 'functionality', description: 'Working demo', maxScore: 10, weight: 1 },
      { name: 'scalability', description: 'Real-world viability', maxScore: 10, weight: 1 },
      { name: 'documentation', description: 'Clear README & pitch', maxScore: 10, weight: 1 },
      { name: 'presentation', description: 'Demo video', maxScore: 10, weight: 1 },
    ],
  });

  useEffect(() => {
    if (!id) return;
    async function loadExistingHackathon() {
      try {
        const mineRes = await apiClient.get('/hackathons/mine');
        const existing = mineRes.hackathons?.find((h) => h._id === id || h.slug === id);
        if (existing) {
          setFormData({
            title: existing.title || '',
            description: existing.description || '',
            theme: existing.theme || ['AI/ML'],
            mode: existing.mode || 'online',
            venue: existing.venue || '',
            bannerUrl: existing.bannerUrl || '',
            registrationDeadline: existing.registrationDeadline ? new Date(existing.registrationDeadline).toISOString().slice(0, 16) : '',
            submissionStart: existing.submissionStart ? new Date(existing.submissionStart).toISOString().slice(0, 16) : '',
            submissionDeadline: existing.submissionDeadline ? new Date(existing.submissionDeadline).toISOString().slice(0, 16) : '',
            reviewDeadline: existing.reviewDeadline ? new Date(existing.reviewDeadline).toISOString().slice(0, 16) : '',
            startDate: existing.startDate ? new Date(existing.startDate).toISOString().slice(0, 16) : '',
            endDate: existing.endDate ? new Date(existing.endDate).toISOString().slice(0, 16) : '',
            prizePool: existing.prizePool || '',
            maxTeamSize: existing.maxTeamSize || 4,
            rules: existing.rules || '',
            judgingCriteria: existing.judgingCriteria?.length ? existing.judgingCriteria : formData.judgingCriteria,
          });
        }
      } catch (err) {
        if (err.details && Array.isArray(err.details)) {
          const msgs = err.details.map((d) => (typeof d === 'object' && d ? `${d.field || 'field'}: ${d.message}` : String(d)));
          showToast(`Validation error: ${msgs.join('; ')}`, 'error');
        } else {
          showToast('Failed to load hackathon data', 'error');
        }
      } finally {
        setFetching(false);
      }
    }
    loadExistingHackathon();
  }, [id]);

  const toggleThemeTag = (t) => {
    setFormData((prev) => ({
      ...prev,
      theme: prev.theme.includes(t) ? prev.theme.filter((item) => item !== t) : [...prev.theme, t],
    }));
  };

  const getIsoPayload = () => {
    const payload = {
      ...formData,
      registrationDeadline: new Date(formData.registrationDeadline).toISOString(),
      submissionStart: new Date(formData.submissionStart).toISOString(),
      submissionDeadline: new Date(formData.submissionDeadline).toISOString(),
      reviewDeadline: new Date(formData.reviewDeadline).toISOString(),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
    };
    // Strip empty optional string fields so Zod .url() doesn't reject ''
    if (!payload.bannerUrl) delete payload.bannerUrl;
    if (!payload.venue) delete payload.venue;
    if (!payload.prizePool) delete payload.prizePool;
    if (!payload.rules) delete payload.rules;
    return payload;
  };

  const handlePublish = async (e) => {
    e.preventDefault();

    // Client-side date ordering check
    const dateErrors = validateHackathonDates(formData);
    if (dateErrors.length > 0) {
      return showToast(dateErrors[0], 'error');
    }

    setLoading(true);
    try {
      const payload = getIsoPayload();

      if (id) {
        // Update existing hackathon
        await apiClient.patch(`/hackathons/${id}`, payload);
        await apiClient.post(`/hackathons/${id}/publish`);
        showToast('Hackathon updated and published successfully!', 'success');
      } else {
        // 1. Create draft
        const draftRes = await apiClient.post('/hackathons', payload);
        const hackathonId = draftRes._id;

        // 2. Publish draft
        await apiClient.post(`/hackathons/${hackathonId}/publish`);
        showToast('Hackathon created and published successfully!', 'success');
      }

      navigate('/app/organizer');
    } catch (err) {
      // Surface Zod validation details if present
      const details = err?.details;
      if (Array.isArray(details) && details.length > 0) {
        const msgs = details.map((d) => `${d.field}: ${d.message}`).join(' | ');
        showToast(msgs, 'error');
      } else {
        showToast(err?.message || err?.error || (typeof err === 'string' ? err : 'Failed to publish hackathon'), 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-12 text-center text-text-secondary">Loading hackathon details...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Wizard Stepper Header */}
      <div className="bg-surface border border-border-subtle rounded-xl p-6">
        <h1 className="text-2xl font-bold font-display text-text-primary mb-4">
          {id ? 'Edit Hackathon' : 'Create New Hackathon'}
        </h1>
        
        <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
          {['1. Basics', '2. Timeline', '3. Rubric & Rules', '4. Review & Publish'].map((label, index) => {
            const stepNum = index + 1;
            const active = step === stepNum;
            const done = step > stepNum;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${
                  done ? 'bg-status-success text-white' : active ? 'bg-accent-primary text-white shadow-glow' : 'bg-surface-raised border border-border-subtle'
                }`}>
                  {done ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                <span className={`hidden sm:inline ${active ? 'text-accent-primary' : ''}`}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <Card className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-primary">Step 1: Basic Information</h3>
            <Input
              label="Hackathon Title"
              placeholder="AI Global Hackathon 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Textarea
              label="Full Description (at least 20 characters)"
              placeholder="Describe the event goals, target audience, and tracks..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
            <div className="space-y-2">
              <label className="block text-xs font-medium text-text-secondary uppercase">Select Themes</label>
              <div className="flex flex-wrap gap-2">
                {HACKATHON_THEMES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleThemeTag(t)}
                    className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
                      formData.theme.includes(t)
                        ? 'bg-accent-primary text-white border-accent-primary'
                        : 'bg-surface-raised border-border-subtle text-text-secondary'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary uppercase">Event Mode</label>
                <select
                  value={formData.mode}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                  className="w-full bg-surface border border-border-subtle rounded-md px-3.5 py-2.5 text-sm text-text-primary"
                >
                  <option value="online">Online</option>
                  <option value="offline">In-Person</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <Input
                label="Prize Pool"
                placeholder="$50,000 USD"
                value={formData.prizePool}
                onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
              />
            </div>

            <Input
              label="Banner Image URL"
              placeholder="https://images.unsplash.com/..."
              value={formData.bannerUrl}
              onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-primary">Step 2: Event Timeline & Deadlines</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Registration Deadline"
                type="datetime-local"
                value={formData.registrationDeadline}
                onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                required
              />
              <Input
                label="Submission Start"
                type="datetime-local"
                value={formData.submissionStart}
                onChange={(e) => setFormData({ ...formData, submissionStart: e.target.value })}
                required
              />
              <Input
                label="Submission Deadline"
                type="datetime-local"
                value={formData.submissionDeadline}
                onChange={(e) => setFormData({ ...formData, submissionDeadline: e.target.value })}
                required
              />
              <Input
                label="Review / Judging Deadline"
                type="datetime-local"
                value={formData.reviewDeadline}
                onChange={(e) => setFormData({ ...formData, reviewDeadline: e.target.value })}
                required
              />
              <Input
                label="Event Start Date"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
              <Input
                label="Event End Date"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-primary">Step 3: Rubric & Event Rules</h3>
            <Textarea
              label="Event Rules & Code of Conduct"
              placeholder="State rules, eligibility requirements, guidelines..."
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
            />

            <div className="space-y-2">
              <label className="block text-xs font-medium text-text-secondary uppercase">
                Judging Criteria Rubric (Max 10 pts per criterion)
              </label>
              {formData.judgingCriteria.map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-surface-raised rounded-lg border border-border-subtle text-xs">
                  <span className="font-semibold text-accent-primary uppercase w-32 shrink-0">{c.name}</span>
                  <input
                    type="text"
                    value={c.description}
                    onChange={(e) => {
                      const list = [...formData.judgingCriteria];
                      list[i].description = e.target.value;
                      setFormData({ ...formData, judgingCriteria: list });
                    }}
                    placeholder="Description"
                    className="flex-1 bg-surface border border-border-subtle rounded px-2.5 py-1 text-text-primary"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-primary">Step 4: Review & Publish</h3>
            <div className="p-4 rounded-lg bg-surface-raised border border-border-subtle text-xs space-y-2">
              <div><span className="text-text-secondary">Title:</span> <strong className="text-text-primary">{formData.title}</strong></div>
              <div><span className="text-text-secondary">Mode:</span> <strong className="uppercase text-text-primary">{formData.mode}</strong></div>
              <div><span className="text-text-secondary">Themes:</span> <strong className="text-text-primary">{formData.theme.join(', ')}</strong></div>
              <div><span className="text-text-secondary">Prize Pool:</span> <strong className="text-accent-primary">{formData.prizePool}</strong></div>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-border-subtle">
          {step > 1 ? (
            <Button variant="secondary" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)}>
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handlePublish} isLoading={loading} className="bg-status-success hover:bg-status-success/90">
              Publish Hackathon
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

export default HackathonWizardPage;
