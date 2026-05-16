import { useState } from 'react';
import { CVData, JDData } from '@/lib/gemini-extraction';
import { motion } from 'motion/react';
import { Plus, Trash2, Save, User, Briefcase, GraduationCap, Code, FolderOpen, Award } from 'lucide-react';

interface CVFormProps {
  data: CVData;
  onChange: (newData: CVData) => void;
}

export function CVForm({ data, onChange }: CVFormProps) {
  const updateProfile = (field: keyof CVData['profile'], value: string) => {
    onChange({ ...data, profile: { ...data.profile, [field]: value } });
  };

  const updateExperience = (index: number, field: keyof CVData['experience'][0], value: any) => {
    const newItems = [...data.experience];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...data, experience: newItems });
  };

  const addExperience = () => {
    onChange({
      ...data,
      experience: [...data.experience, { role: '', company: '', duration: '', responsibilities: [] }]
    });
  };

  const removeExperience = (index: number) => {
    onChange({ ...data, experience: data.experience.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-8 text-slate-200">
      {/* Profile */}
      <section className="bento-card bg-slate-900/60 p-6 space-y-4">
        <div className="flex items-center gap-2 text-blue-400 mb-2">
          <User size={20} />
          <h3 className="font-bold uppercase tracking-widest text-sm">Profil Pribadi</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-slate-500 uppercase font-bold">Nama Lengkap</label>
            <input 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-sm mt-1 outline-none focus:ring-1 focus:ring-blue-500"
              value={data.profile.name}
              onChange={(e) => updateProfile('name', e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase font-bold">Email</label>
            <input 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-sm mt-1 outline-none focus:ring-1 focus:ring-blue-500"
              value={data.profile.email}
              onChange={(e) => updateProfile('email', e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase font-bold">Telepon</label>
            <input 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-sm mt-1 outline-none focus:ring-1 focus:ring-blue-500"
              value={data.profile.phone}
              onChange={(e) => updateProfile('phone', e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase font-bold">Lokasi</label>
            <input 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-sm mt-1 outline-none focus:ring-1 focus:ring-blue-500"
              value={data.profile.location}
              onChange={(e) => updateProfile('location', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <Briefcase size={20} />
            <h3 className="font-bold uppercase tracking-widest text-sm">Pengalaman Kerja</h3>
          </div>
          <button onClick={addExperience} className="p-1 hover:bg-slate-800 rounded bg-slate-900 border border-slate-800 text-slate-400 cursor-pointer">
            <Plus size={16} />
          </button>
        </div>
        {data.experience.map((exp, idx) => (
          <div key={idx} className="bento-card bg-slate-900/40 p-6 relative group">
            <button 
              onClick={() => removeExperience(idx)}
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-red-400"
            >
              <Trash2 size={16} />
            </button>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold">Posisi</label>
                <input 
                  className="w-full bg-slate-800/30 border border-slate-800 rounded-lg p-2 text-sm mt-1"
                  value={exp.role}
                  onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold">Perusahaan</label>
                <input 
                  className="w-full bg-slate-800/30 border border-slate-800 rounded-lg p-2 text-sm mt-1"
                  value={exp.company}
                  onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold">Durasi</label>
                <input 
                  className="w-full bg-slate-800/30 border border-slate-800 rounded-lg p-2 text-sm mt-1"
                  value={exp.duration}
                  onChange={(e) => updateExperience(idx, 'duration', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-bold">Tanggung Jawab (Pisahkan baris baru)</label>
              <textarea 
                className="w-full bg-slate-800/30 border border-slate-800 rounded-lg p-2 text-sm mt-1 h-24 whitespace-pre-wrap"
                value={exp.responsibilities.join('\n')}
                onChange={(e) => updateExperience(idx, 'responsibilities', e.target.value.split('\n'))}
              />
            </div>
          </div>
        ))}
      </section>

      {/* Education */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-yellow-400">
            <GraduationCap size={20} />
            <h3 className="font-bold uppercase tracking-widest text-sm">Pendidikan</h3>
          </div>
          <button onClick={() => onChange({...data, education: [...data.education, {degree: '', institution: '', year: ''}]})} className="p-1 hover:bg-slate-800 rounded bg-slate-900 border border-slate-800 text-slate-400 cursor-pointer">
            <Plus size={16} />
          </button>
        </div>
        {data.education.map((edu, idx) => (
          <div key={idx} className="bento-card bg-slate-900/40 p-4 relative group grid grid-cols-3 gap-4">
            <button 
              onClick={() => onChange({...data, education: data.education.filter((_, i) => i !== idx)})}
              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 border border-slate-700 p-1 rounded-full text-red-400"
            >
              <Trash2 size={12} />
            </button>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-bold">Gelar</label>
              <input 
                className="w-full bg-slate-800/30 border border-slate-800 rounded-lg p-2 text-sm mt-1"
                value={edu.degree}
                onChange={(e) => {
                    const newEdu = [...data.education];
                    newEdu[idx].degree = e.target.value;
                    onChange({...data, education: newEdu});
                }}
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-bold">Institusi</label>
              <input 
                className="w-full bg-slate-800/30 border border-slate-800 rounded-lg p-2 text-sm mt-1"
                value={edu.institution}
                onChange={(e) => {
                    const newEdu = [...data.education];
                    newEdu[idx].institution = e.target.value;
                    onChange({...data, education: newEdu});
                }}
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-bold">Tahun</label>
              <input 
                className="w-full bg-slate-800/30 border border-slate-800 rounded-lg p-2 text-sm mt-1"
                value={edu.year}
                onChange={(e) => {
                    const newEdu = [...data.education];
                    newEdu[idx].year = e.target.value;
                    onChange({...data, education: newEdu});
                }}
              />
            </div>
          </div>
        ))}
      </section>

      {/* Projects */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-pink-400">
            <FolderOpen size={20} />
            <h3 className="font-bold uppercase tracking-widest text-sm">Proyek</h3>
          </div>
          <button onClick={() => onChange({...data, projects: [...data.projects, {name: '', description: ''}]})} className="p-1 hover:bg-slate-800 rounded bg-slate-900 border border-slate-800 text-slate-400 cursor-pointer">
            <Plus size={16} />
          </button>
        </div>
        {data.projects.map((proj, idx) => (
          <div key={idx} className="bento-card bg-slate-900/40 p-4 relative group space-y-2">
            <button 
              onClick={() => onChange({...data, projects: data.projects.filter((_, i) => i !== idx)})}
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-red-400"
            >
              <Trash2 size={14} />
            </button>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-bold">Nama Proyek</label>
              <input 
                className="w-full bg-slate-800/30 border border-slate-800 rounded-lg p-2 text-sm mt-1"
                value={proj.name}
                onChange={(e) => {
                    const newProj = [...data.projects];
                    newProj[idx].name = e.target.value;
                    onChange({...data, projects: newProj});
                }}
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-bold">Deskripsi</label>
              <textarea 
                className="w-full bg-slate-800/30 border border-slate-800 rounded-lg p-2 text-sm mt-1"
                value={proj.description}
                onChange={(e) => {
                    const newProj = [...data.projects];
                    newProj[idx].description = e.target.value;
                    onChange({...data, projects: newProj});
                }}
              />
            </div>
          </div>
        ))}
      </section>

      {/* Skills */}
      <section className="bento-card bg-slate-900/40 p-6 space-y-4">
        <div className="flex items-center gap-2 text-purple-400">
          <Code size={20} />
          <h3 className="font-bold uppercase tracking-widest text-sm">Keahlian (Skills)</h3>
        </div>
        <textarea 
          className="w-full bg-slate-800/30 border border-slate-800 rounded-lg p-3 text-sm h-32"
          placeholder="Daftar keahlian dipisah koma atau baris baru..."
          value={data.skills.join(', ')}
          onChange={(e) => onChange({ ...data, skills: e.target.value.split(/[,\n]/).map(s => s.trim()).filter(Boolean) })}
        />
      </section>

      {/* Certifications */}
      <section className="bento-card bg-slate-900/40 p-6 space-y-4">
        <div className="flex items-center gap-2 text-yellow-500">
          <Award size={20} />
          <h3 className="font-bold uppercase tracking-widest text-sm">Sertifikasi</h3>
        </div>
        <textarea 
          className="w-full bg-slate-800/30 border border-slate-800 rounded-lg p-3 text-sm h-24"
          placeholder="Daftar sertifikasi..."
          value={data.certifications.join(', ')}
          onChange={(e) => onChange({ ...data, certifications: e.target.value.split(/[,\n]/).map(s => s.trim()).filter(Boolean) })}
        />
      </section>
    </div>
  );
}

interface JDFormProps {
  data: JDData;
  onChange: (newData: JDData) => void;
}

export function JDForm({ data, onChange }: JDFormProps) {
  const updateList = (field: keyof JDData, value: string) => {
    onChange({ ...data, [field]: value.split('\n').filter(Boolean) });
  };

  return (
    <div className="space-y-6 text-slate-200">
      <section className="bento-accent p-8 space-y-6">
        <div>
          <label className="text-[10px] text-blue-400 uppercase font-black tracking-[0.2em] mb-2 block">Role Name</label>
          <input 
            className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl p-4 text-xl font-bold"
            value={data.role}
            onChange={(e) => onChange({ ...data, role: e.target.value })}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Requirements</h4>
            <textarea 
              className="w-full h-64 bg-slate-950/40 border border-slate-800 rounded-2xl p-4 text-sm font-medium leading-relaxed"
              value={data.requirements.join('\n')}
              onChange={(e) => updateList('requirements', e.target.value)}
            />
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Responsibilities</h4>
            <textarea 
              className="w-full h-64 bg-slate-950/40 border border-slate-800 rounded-2xl p-4 text-sm font-medium leading-relaxed"
              value={data.responsibilities.join('\n')}
              onChange={(e) => updateList('responsibilities', e.target.value)}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
