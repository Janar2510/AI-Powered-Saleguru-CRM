import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { supabase } from '../services/supabase';
import { Plus, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCompanies } from '../hooks/useCompanies';
import { useContacts } from '../hooks/useContacts';
import Spline from '@splinetool/react-spline';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  due_date?: string;
  completion_percent: number;
  company_id?: string;
  contact_id?: string;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', due_date: '', company_id: '', contact_id: '' });
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { companies, isLoading: companiesLoading } = useCompanies();
  const { contacts, isLoading: contactsLoading } = useContacts();
  const [filter, setFilter] = useState({ status: '', company: '', search: '', dueFrom: '', dueTo: '' });

  // Dummy projects for demo
  const demoProjects: Project[] = [
    {
      id: '1',
      name: 'CRM Redesign',
      description: 'Complete UI/UX overhaul for the SaleToru CRM platform.',
      status: 'Active',
      due_date: '2024-08-15',
      completion_percent: 62
    },
    {
      id: '2',
      name: 'AI Lead Scoring',
      description: 'Integrate AI-powered lead scoring and smart suggestions.',
      status: 'At Risk',
      due_date: '2024-07-30',
      completion_percent: 38
    },
    {
      id: '3',
      name: 'Mobile App Launch',
      description: 'Release the new mobile app for iOS and Android.',
      status: 'Completed',
      due_date: '2024-06-10',
      completion_percent: 100
    },
    {
      id: '4',
      name: 'Marketplace Integrations',
      description: 'Add new integrations to the app marketplace.',
      status: 'Active',
      due_date: '2024-09-01',
      completion_percent: 20
    },
    {
      id: '5',
      name: 'Onboarding Automation',
      description: 'Automate onboarding for new users and teams.',
      status: 'Active',
      due_date: '2024-08-01',
      completion_percent: 55
    },
    {
      id: '6',
      name: 'Data Migration',
      description: 'Migrate legacy CRM data to the new platform.',
      status: 'Completed',
      due_date: '2024-05-20',
      completion_percent: 100
    },
    {
      id: '7',
      name: 'Performance Optimization',
      description: 'Improve backend and frontend performance.',
      status: 'Active',
      due_date: '2024-08-20',
      completion_percent: 47
    },
    {
      id: '8',
      name: 'Customer Portal',
      description: 'Build a self-service portal for customers.',
      status: 'At Risk',
      due_date: '2024-09-10',
      completion_percent: 12
    }
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      setProjects(data);
    } else {
      setProjects(demoProjects); // Use demo data if no Supabase data
    }
    setLoading(false);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setCreating(false);
      alert('You must be logged in to create a project.');
      return;
    }
    const { error } = await supabase.from('projects').insert({
      name: newProject.name,
      description: newProject.description,
      due_date: newProject.due_date || null,
      status: 'Active',
      completion_percent: 0,
      company_id: newProject.company_id || null,
      contact_id: newProject.contact_id || null,
      owner_id: user.id
    });
    setCreating(false);
    setShowCreate(false);
    setNewProject({ name: '', description: '', due_date: '', company_id: '', contact_id: '' });
    if (!error) fetchProjects();
  };

  // Filtered projects
  const filteredProjects = projects.filter(project => {
    const matchesStatus = !filter.status || project.status === filter.status;
    const matchesCompany = !filter.company || (project.company_id === filter.company);
    const matchesSearch = !filter.search || project.name.toLowerCase().includes(filter.search.toLowerCase());
    const matchesDueFrom = !filter.dueFrom || (project.due_date && project.due_date >= filter.dueFrom);
    const matchesDueTo = !filter.dueTo || (project.due_date && project.due_date <= filter.dueTo);
    return matchesStatus && matchesCompany && matchesSearch && matchesDueFrom && matchesDueTo;
  });

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 3D Spline Background */}
      <div className="fixed inset-0 z-0">
        <Spline scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode" />
      </div>
      <div className="relative z-10 space-y-12 px-4 md:px-12 lg:px-32 pt-12 transition-all duration-300">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent tracking-tight">Projects</h1>
            <p className="text-[#b0b0d0] mt-1 text-lg">Track and manage all your projects in one place</p>
          </div>
          <Button onClick={() => setShowCreate(true)} size="lg" variant="gradient" className="flex items-center space-x-2 h-12 min-w-[140px]">
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </Button>
        </div>

        {/* Guru AI Assistant Placeholder */}
        <div className="flex items-center space-x-3 mb-4">
          <Sparkles className="w-6 h-6 text-primary-400" />
          <span className="text-primary-300 font-medium">Ask Guru for a project summary or suggestions (coming soon)</span>
        </div>

        {/* Create Project Modal/Form */}
        {showCreate && (
          <form onSubmit={handleCreateProject} className="rounded-xl shadow-lg space-y-4 max-w-lg mx-auto bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 p-6">
            <h2 className="text-lg font-semibold text-white mb-2">Create New Project</h2>
            <input
              type="text"
              required
              placeholder="Project Name"
              value={newProject.name}
              onChange={e => setNewProject({ ...newProject, name: e.target.value })}
              className="w-full px-3 py-2 rounded bg-[#23233a]/50 text-white border-2 border-white/20 focus:outline-none focus:border-[#a259ff]"
            />
            <textarea
              placeholder="Description (optional)"
              value={newProject.description}
              onChange={e => setNewProject({ ...newProject, description: e.target.value })}
              className="w-full px-3 py-2 rounded bg-[#23233a]/50 text-white border-2 border-white/20 focus:outline-none focus:border-[#a259ff]"
              rows={3}
            />
            <input
              type="date"
              value={newProject.due_date}
              onChange={e => setNewProject({ ...newProject, due_date: e.target.value })}
              className="w-full px-3 py-2 rounded bg-[#23233a]/50 text-white border-2 border-white/20 focus:outline-none focus:border-[#a259ff]"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Company</label>
                <select
                  value={newProject.company_id}
                  onChange={e => setNewProject({ ...newProject, company_id: e.target.value })}
                  className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                  disabled={companiesLoading}
                >
                  <option value="">Select a company</option>
                  {(companies || []).map(company => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Contact</label>
                <select
                  value={newProject.contact_id}
                  onChange={e => setNewProject({ ...newProject, contact_id: e.target.value })}
                  className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                  disabled={contactsLoading}
                >
                  <option value="">Select a contact</option>
                  {(contacts || []).map(contact => (
                    <option key={contact.id} value={contact.id}>{contact.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" onClick={() => setShowCreate(false)} variant="secondary">Cancel</Button>
              <Button type="submit" loading={!!creating}>Create</Button>
            </div>
          </form>
        )}

        {/* Advanced Filters */}
        <div className="flex flex-wrap gap-4 mb-6 items-end rounded-xl bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 p-4 shadow">
          <div>
            <label className="block text-xs text-secondary-400 mb-1">Status</label>
            <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} className="px-3 py-2 rounded bg-secondary-700 text-white border border-secondary-600">
              <option value="">All</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="At Risk">At Risk</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-secondary-400 mb-1">Company</label>
            <select value={filter.company} onChange={e => setFilter(f => ({ ...f, company: e.target.value }))} className="px-3 py-2 rounded bg-secondary-700 text-white border border-secondary-600">
              <option value="">All</option>
              {(companies || []).map(company => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-secondary-400 mb-1">Due From</label>
            <input type="date" value={filter.dueFrom} onChange={e => setFilter(f => ({ ...f, dueFrom: e.target.value }))} className="px-3 py-2 rounded bg-secondary-700 text-white border border-secondary-600" />
          </div>
          <div>
            <label className="block text-xs text-secondary-400 mb-1">Due To</label>
            <input type="date" value={filter.dueTo} onChange={e => setFilter(f => ({ ...f, dueTo: e.target.value }))} className="px-3 py-2 rounded bg-secondary-700 text-white border border-secondary-600" />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-secondary-400 mb-1">Search</label>
            <input type="text" placeholder="Search by name..." value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} className="px-3 py-2 rounded bg-secondary-700 text-white border border-secondary-600 w-full" />
          </div>
        </div>

        {/* Projects List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center items-center h-32">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <Card variant="glass" className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium text-white mb-2">No projects found</h3>
              <p className="text-[#b0b0d0]">Try adjusting your filters or create a new project.</p>
            </Card>
          ) : (
            filteredProjects.map(project => (
              <Card
                key={project.id}
                variant="glass"
                className="p-6 flex flex-col space-y-3 hover:border-[#a259ff] transition cursor-pointer"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">{project.name}</h2>
                  <Badge variant={project.status === 'Active' ? 'success' : project.status === 'Completed' ? 'primary' : 'warning'}>
                    {project.status}
                  </Badge>
                </div>
                <p className="text-[#b0b0d0] text-sm line-clamp-2">{project.description}</p>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-[#b0b0d0]">Due:</span>
                  <span className="text-white font-medium">{project.due_date ? new Date(project.due_date).toLocaleDateString() : '\u2014'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[#b0b0d0] text-xs">Progress</span>
                  <div className="flex-1 h-2 bg-[#23233a]/50 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-[#a259ff] rounded-full transition-all"
                      style={{ width: `${project.completion_percent || 0}%` }}
                    />
                  </div>
                  <span className="text-[#a259ff] text-xs font-semibold">{Math.round(project.completion_percent || 0)}%</span>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* TODO: Add Kanban/Board view, Gantt view, filters, and more Guru AI features */}
      </div>
    </div>
  );
};

export default Projects; 