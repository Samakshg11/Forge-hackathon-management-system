import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useToast } from '../components/ui/Toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { Users, Send, UserPlus, FileCode, Crown, LogOut, UserX, ShieldAlert, Trash2 } from 'lucide-react';

export function TeamWorkspacePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket, joinRoom, leaveRoom } = useSocket();
  const showToast = useToast();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const chatBottomRef = useRef(null);

  const loadTeam = async () => {
    try {
      const res = await apiClient.get(`/teams/${id}`);
      setTeam(res.data);
    } catch {
      setTeam(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
    joinRoom('team', id);
    return () => leaveRoom('team', id);
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleMemberJoined = (data) => {
      showToast(`${data.member?.name || 'A member'} joined the team!`, 'success');
      loadTeam();
    };

    socket.on('message:new', handleNewMessage);
    socket.on('team:memberJoined', handleMemberJoined);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('team:memberJoined', handleMemberJoined);
    };
  }, [socket]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msgObj = {
      _id: Date.now().toString(),
      senderId: { _id: user._id, name: user.name, avatarUrl: user.avatarUrl },
      text: newMessage,
      sentAt: new Date(),
    };

    setMessages((prev) => [...prev, msgObj]);
    setNewMessage('');

    if (socket) {
      socket.emit('message:send', { teamId: id, text: newMessage, senderId: user._id });
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(`/teams/${id}/invite`, { email: inviteEmail });
      showToast('Invitation sent successfully!', 'success');
      setInviteEmail('');
      setInviteModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to send invite', 'error');
    }
  };

  const handleRemoveMember = async (memberUserId) => {
    if (!window.confirm('Are you sure you want to remove this member from the team?')) return;
    try {
      await apiClient.delete(`/teams/${id}/members/${memberUserId}`);
      showToast('Member removed from team', 'info');
      loadTeam();
    } catch (err) {
      showToast(err.message || 'Failed to remove member', 'error');
    }
  };

  const handleTransferOwnership = async (newOwnerId) => {
    if (!window.confirm('Are you sure you want to transfer leadership to this member?')) return;
    try {
      await apiClient.post(`/teams/${id}/transfer-ownership`, { newOwnerId });
      showToast('Team leadership transferred successfully!', 'success');
      loadTeam();
    } catch (err) {
      showToast(err.message || 'Failed to transfer ownership', 'error');
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm('Are you sure you want to leave this team?')) return;
    try {
      await apiClient.delete(`/teams/${id}/members/${user._id}`);
      showToast('You have left the team', 'info');
      navigate('/app/dashboard');
    } catch (err) {
      showToast(err.message || 'Failed to leave team', 'error');
    }
  };

  const handleDeleteTeam = async () => {
    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) return;
    try {
      await apiClient.delete(`/teams/${id}`);
      showToast('Team deleted', 'info');
      navigate('/app/dashboard');
    } catch (err) {
      showToast(err.message || 'Failed to delete team', 'error');
    }
  };

  if (loading) return <Skeleton className="h-96 w-full" />;

  if (!team) {
    return <div className="text-center py-12 text-text-secondary">Team not found or access denied.</div>;
  }

  const isOwner = team.ownerId?._id === user._id || team.ownerId === user._id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-border-subtle p-6 rounded-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold font-display text-text-primary">{team.name}</h1>
            <Badge status="approved">Team</Badge>
          </div>
          <p className="text-xs text-text-secondary">{team.hackathonId?.title}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isOwner && (
            <Button onClick={() => setInviteModalOpen(true)} size="sm">
              <UserPlus className="w-4 h-4 mr-1.5" /> Invite Member
            </Button>
          )}

          <Link to={`/app/teams/${id}/submission`}>
            <Button variant="secondary" size="sm">
              <FileCode className="w-4 h-4 mr-1.5" /> Project Submission
            </Button>
          </Link>

          {!isOwner && (
            <Button onClick={handleLeaveTeam} variant="secondary" size="sm" className="text-status-danger border-status-danger/30 hover:bg-status-danger/10">
              <LogOut className="w-4 h-4 mr-1.5" /> Leave Team
            </Button>
          )}

          {isOwner && (
            <Button onClick={handleDeleteTeam} variant="secondary" size="sm" className="text-status-danger border-status-danger/30 hover:bg-status-danger/10">
              <Trash2 className="w-4 h-4 mr-1.5" /> Delete Team
            </Button>
          )}
        </div>
      </div>

      {/* Grid: Roster + Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roster Panel */}
        <Card className="space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-accent-primary" /> Members ({team.members?.length || 0} / {team.hackathonId?.maxTeamSize || 4})
            </h3>
          </div>

          <div className="space-y-3">
            {team.members?.map((m) => {
              const memUser = m.userId;
              const memUserId = memUser?._id || m.userId;
              const memIsOwner = team.ownerId?._id === memUserId || team.ownerId === memUserId;
              const isMe = memUserId === user._id;

              return (
                <div key={memUserId} className="flex items-center justify-between p-3 rounded-lg bg-surface-raised border border-border-subtle">
                  <div className="flex items-center gap-3">
                    <Avatar src={memUser?.avatarUrl} name={memUser?.name || 'Member'} size="sm" />
                    <div>
                      <h4 className="text-xs font-semibold text-text-primary flex items-center gap-1">
                        {memUser?.name || 'Team Member'}
                        {memIsOwner && <Crown className="w-3.5 h-3.5 text-amber-400" title="Team Leader" />}
                      </h4>
                      <p className="text-[10px] text-text-secondary">{memUser?.email}</p>
                    </div>
                  </div>

                  {isOwner && !isMe && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTransferOwnership(memUserId)}
                        className="p-1 rounded hover:bg-surface text-text-secondary hover:text-amber-400"
                        title="Transfer Leadership"
                      >
                        <Crown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveMember(memUserId)}
                        className="p-1 rounded hover:bg-surface text-text-secondary hover:text-status-danger"
                        title="Remove Member"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Team Chat Channel */}
        <Card className="lg:col-span-2 flex flex-col h-[500px]">
          <div className="pb-3 border-b border-border-subtle">
            <h3 className="text-sm font-bold text-text-primary">Team Chat Channel</h3>
            <p className="text-[10px] text-text-secondary">Real-time team coordination</p>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-xs text-text-secondary">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.senderId?._id === user._id;
                return (
                  <div key={msg._id} className={`flex items-start gap-2.5 ${isMine ? 'flex-row-reverse' : ''}`}>
                    <Avatar src={msg.senderId?.avatarUrl} name={msg.senderId?.name} size="sm" />
                    <div className={`p-3 rounded-lg max-w-xs text-xs space-y-1 ${isMine ? 'bg-accent-primary text-white' : 'bg-surface-raised text-text-primary border border-border-subtle'}`}>
                      <div className="font-semibold text-[10px] opacity-80">{msg.senderId?.name}</div>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-border-subtle flex gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </Card>
      </div>

      {/* Invite Member Modal */}
      <Modal isOpen={inviteModalOpen} onClose={() => setInviteModalOpen(false)} title="Invite Team Member">
        <form onSubmit={handleInvite} className="space-y-4">
          <Input
            label="Member Email Address"
            type="email"
            placeholder="colleague@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
          <p className="text-xs text-text-secondary">
            Invited user must have an approved registration for this hackathon.
          </p>
          <Button type="submit" className="w-full">
            Send Invite
          </Button>
        </form>
      </Modal>
    </div>
  );
}

export default TeamWorkspacePage;
