import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Card } from '../components/ui/Card';
import { Input, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { Lock, History, Save, CheckCircle, AlertCircle } from 'lucide-react';

export function SubmissionFormPage() {
  const { id: teamId } = useParams();
  const { user } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState('saved'); // saved | saving | error
  const [versions, setVersions] = useState([]);
  const [showVersions, setShowVersions] = useState(false);

  const [formData, setFormData] = useState({
    projectName: '',
    problemStatement: '',
    solution: '',
    githubUrl: '',
    liveDemoUrl: '',
    techStack: '',
    presentationUrl: '',
    screenshotUrls: '',
  });

  useEffect(() => {
    async function loadSubmission() {
      try {
        const teamRes = await apiClient.get(`/teams/${teamId}`);
        if (teamRes.submissionId) {
          const subId = teamRes.submissionId._id || teamRes.submissionId;
          const subRes = await apiClient.get(`/submissions/${subId}`);
          setSubmission(subRes);
          setFormData({
            projectName: subRes.projectName || '',
            problemStatement: subRes.problemStatement || '',
            solution: subRes.solution || '',
            githubUrl: subRes.githubUrl || '',
            liveDemoUrl: subRes.liveDemoUrl || '',
            techStack: subRes.techStack?.join(', ') || '',
            presentationUrl: subRes.presentationUrl || '',
            screenshotUrls: subRes.screenshotUrls?.join(', ') || '',
          });
        }
      } catch {
        setSubmission(null);
      } finally {
        setLoading(false);
      }
    }
    loadSubmission();
  }, [teamId]);

  // Debounced autosave effect (10s interval, Doc 2 §3.2)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!submission || submission.locked) return;

    const timer = setTimeout(async () => {
      setAutosaveStatus('saving');
      try {
        const stack = formData.techStack.split(',').map((s) => s.trim()).filter(Boolean);
        const screenshots = formData.screenshotUrls.split(',').map((s) => s.trim()).filter(Boolean);
        const res = await apiClient.patch(`/submissions/${submission._id}`, {
          ...formData,
          techStack: stack,
          screenshotUrls: screenshots,
        });
        setSubmission(res);
        setAutosaveStatus('saved');
      } catch {
        setAutosaveStatus('error');
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [formData, submission]);

  const handleCreateDraft = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const teamRes = await apiClient.get(`/teams/${teamId}`);
      const stack = formData.techStack.split(',').map((s) => s.trim()).filter(Boolean);
      const screenshots = formData.screenshotUrls.split(',').map((s) => s.trim()).filter(Boolean);

      const res = await apiClient.post('/submissions', {
        ...formData,
        techStack: stack,
        screenshotUrls: screenshots,
        teamId,
        hackathonId: teamRes.hackathonId?._id || teamRes.hackathonId,
      });

      setSubmission(res);
      showToast('Draft submission created successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to create draft', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!submission) return;
    setSubmitting(true);
    try {
      const res = await apiClient.post(`/submissions/${submission._id}/submit`);
      setSubmission(res.data);
      showToast('Project submitted successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchVersions = async () => {
    if (!submission) return;
    try {
      const res = await apiClient.get(`/submissions/${submission._id}/versions`);
      setVersions(res.data);
      setShowVersions(true);
    } catch (err) {
      showToast(err.message || 'Failed to fetch version history', 'error');
    }
  };

  if (loading) return <Skeleton className="h-96 w-full" />;

  const isLocked = submission?.locked;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border-subtle p-6 rounded-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold font-display text-text-primary">Project Submission Form</h1>
            {submission && <Badge status={submission.status} />}
          </div>
          <p className="text-xs text-text-secondary">
            Fill out your project details. Autosave triggers every 10s.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {submission && (
            <button
              onClick={fetchVersions}
              className="px-3 py-1.5 rounded-md bg-surface-raised border border-border-subtle text-xs text-text-secondary hover:text-text-primary flex items-center gap-1.5"
            >
              <History className="w-4 h-4" /> History
            </button>
          )}

          {autosaveStatus === 'saving' && <span className="text-xs text-status-warning animate-pulse">Autosaving...</span>}
          {autosaveStatus === 'saved' && <span className="text-xs text-status-success flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Saved</span>}
        </div>
      </div>

      {isLocked && (
        <div className="p-4 rounded-xl bg-status-danger/10 border border-status-danger/30 flex items-center gap-3 text-status-danger text-sm">
          <Lock className="w-5 h-5 shrink-0" />
          <span>The submission deadline has passed. This project form is locked.</span>
        </div>
      )}

      {/* Form */}
      <Card className="space-y-6">
        <form onSubmit={submission ? (e) => e.preventDefault() : handleCreateDraft} className="space-y-4">
          <Input
            label="Project Name"
            placeholder="Awesome App"
            disabled={isLocked}
            value={formData.projectName}
            onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
            required
          />

          <Textarea
            label="Problem Statement"
            placeholder="What problem does your project solve?"
            disabled={isLocked}
            value={formData.problemStatement}
            onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
            required
          />

          <Textarea
            label="Solution Description"
            placeholder="How does your project work and what is unique about it?"
            disabled={isLocked}
            value={formData.solution}
            onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
            required
          />

          <Input
            label="GitHub Repository URL"
            placeholder="https://github.com/org/repo"
            disabled={isLocked}
            value={formData.githubUrl}
            onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
            required
          />

          <Input
            label="Live Demo / Deployment URL"
            placeholder="https://myproject.vercel.app"
            disabled={isLocked}
            value={formData.liveDemoUrl}
            onChange={(e) => setFormData({ ...formData, liveDemoUrl: e.target.value })}
          />

          <Input
            label="Tech Stack (comma-separated)"
            placeholder="React, Express, MongoDB, Tailwind"
            disabled={isLocked}
            value={formData.techStack}
            onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
            required
          />

          <Input
            label="Presentation Deck URL"
            placeholder="https://slides.google.com/..."
            disabled={isLocked}
            value={formData.presentationUrl}
            onChange={(e) => setFormData({ ...formData, presentationUrl: e.target.value })}
          />

          <Input
            label="Screenshot Image URLs (comma-separated)"
            placeholder="https://example.com/shot1.png, https://example.com/shot2.png"
            disabled={isLocked}
            value={formData.screenshotUrls}
            onChange={(e) => setFormData({ ...formData, screenshotUrls: e.target.value })}
          />

          {!submission && (
            <Button type="submit" isLoading={saving} className="w-full">
              Create Submission Draft
            </Button>
          )}
        </form>

        {submission && !isLocked && (
          <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-text-secondary">
              Status: <span className="font-semibold uppercase text-text-primary">{submission.status}</span>
            </span>
            <Button
              onClick={handleFinalSubmit}
              isLoading={submitting}
              className="w-full sm:w-auto bg-status-success hover:bg-status-success/90"
            >
              Finalize & Submit Project
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default SubmissionFormPage;
