import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { ShieldAlert, UserCheck, Search, PlusCircle, ToggleLeft, ToggleRight } from 'lucide-react';

interface UsersScreenProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onToggleUserStatus: (id: string) => void;
}

export default function UsersScreen({ users, onAddUser, onToggleUserStatus }: UsersScreenProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  
  // Create states
  const [newNome, setNewNome] = useState<string>('');
  const [newRole, setNewRole] = useState<UserRole>('Garçom');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newUsername, setNewUsername] = useState<string>('');
  const [newSenha, setNewSenha] = useState<string>('123');

  const filtered = users.filter(u => 
    u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNome || !newEmail) return;

    const finalUsername = newUsername.trim().toLowerCase() || newEmail.split('@')[0] || newNome.toLowerCase().replace(/\s+/g, '.');

    onAddUser({
      nome: newNome,
      role: newRole,
      email: newEmail,
      status: 'Ativo',
      username: finalUsername,
      senha: newSenha || '123'
    });

    setNewNome('');
    setNewEmail('');
    setNewRole('Garçom');
    setNewUsername('');
    setNewSenha('123');
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-6 select-none">
      
      <div className="bg-brand-charcoal border border-brand-light-charcoal p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <span className="text-brand-yellow font-mono text-[10px] font-bold tracking-widest uppercase">EQUIPE OPERACIONAL</span>
          <h2 className="text-xl font-sora font-extrabold text-white mt-1">Colaboradores & Permissões</h2>
          <p className="text-xs text-gray-400 mt-0.5">Audite e cadastre as credenciais do time de salão (Garçons), retaguarda (Caixa) e cozinha (Chef).</p>
        </div>

        <button
          id="btn-trigger-users-create"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-brand-yellow text-brand-black hover:bg-brand-yellow-dark px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition"
        >
          <PlusCircle className="w-4.5 h-4.5" /> Adicionar Colaborador
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleSubmit} className="bg-brand-charcoal border border-brand-light-charcoal p-5 rounded-xl grid grid-cols-1 md:grid-cols-5 gap-4 animate-in slide-in-from-top duration-200">
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] text-gray-400 font-bold uppercase font-mono">Nome do Colaborador</label>
            <input
              id="user-new-nome"
              type="text"
              required
              value={newNome}
              onChange={(e) => setNewNome(e.target.value)}
              placeholder="Ex: João Silva (Garçom)"
              className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white p-2.5 rounded-lg font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase font-mono">Perfil Operacional</label>
            <select
              id="select-user-new-role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
              className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white p-2.5 rounded-lg font-bold"
            >
              <option value="Garçom">Garçom (Salão)</option>
              <option value="Cozinheiro">Cozinheiro (Cozinha)</option>
              <option value="Caixa">Caixa (Operacional Frente)</option>
              <option value="Gerente">Gerente (Gestor Geral)</option>
              <option value="Supervisor">Supervisor de Auditoria</option>
            </select>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] text-gray-400 font-bold uppercase font-mono">Endereço de E-mail</label>
            <input
              id="user-new-email"
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Ex: joao@digaorestaurante.com.br"
              className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white p-2.5 rounded-lg font-mono"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] text-gray-400 font-bold uppercase font-mono">Username de Login</label>
            <input
              id="user-new-username"
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Deixe em branco para autoGeração"
              className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white p-2.5 rounded-lg font-mono font-semibold"
            />
          </div>

          <div className="space-y-1 md:col-span-3">
            <label className="text-[10px] text-gray-400 font-bold uppercase font-mono">Senha de Acesso</label>
            <input
              id="user-new-senha"
              type="text"
              required
              value={newSenha}
              onChange={(e) => setNewSenha(e.target.value)}
              placeholder="Senha de acesso"
              className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white p-2.5 rounded-lg font-mono text-brand-yellow font-bold"
            />
          </div>

          <div className="col-span-1 md:col-span-3 flex justify-end gap-3 pt-2 border-t border-brand-light-charcoal/30">
            <button
              id="btn-user-cancel"
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="bg-transparent hover:bg-brand-light-charcoal text-gray-400 hover:text-white text-xs font-bold uppercase py-2 px-4"
            >
              Cancelar
            </button>
            <button
              id="btn-user-submit"
              type="submit"
              className="bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black text-xs font-extrabold uppercase px-6 py-2 rounded-lg"
            >
              Cadastrar Colaborador
            </button>
          </div>
        </form>
      )}

      <div className="bg-brand-charcoal border border-brand-light-charcoal rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 bg-brand-light-charcoal/20 border-b border-brand-light-charcoal">
          <div className="relative max-w-sm">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              id="input-user-search-filter"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar colaborador por nome, role..."
              className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white pl-9 pr-3 py-2 rounded-lg"
            />
          </div>
        </div>

        <div className="overflow-x-auto text-xs text-gray-200">
          <table className="min-w-[700px] w-full text-left font-sans">
            <thead>
              <tr className="bg-brand-light-charcoal/30 border-b border-brand-light-charcoal text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="p-4">Colaborador</th>
                <th className="p-4">Perfil Operacional</th>
                <th className="p-4">E-mail Corporativo</th>
                <th className="p-4">Login Concedido</th>
                <th className="p-4 text-right">Ação Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-light-charcoal/50">
              {filtered.map(u => {
                const isActive = u.status === 'Ativo';
                const isManager = u.role === 'Gerente';

                return (
                  <tr key={u.id} className="hover:bg-brand-light-charcoal/30 transition">
                    <td className="p-4 font-bold">
                      {u.nome}
                    </td>
                    <td className="p-4 font-mono font-bold text-brand-yellow">
                      {u.role.toUpperCase()}
                    </td>
                    <td className="p-4 font-mono text-gray-400">
                      {u.email}
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                          isActive 
                            ? 'text-green-600 bg-green-500/10 border-green-500/25' 
                            : 'text-zinc-500 bg-zinc-500/10 border-zinc-500/25'
                        }`}>
                          {u.status.toUpperCase()}
                        </span>
                      </div>
                      {u.username && (
                        <div className="text-[10px] text-zinc-500 font-mono">
                          User: <strong className="text-zinc-800">{u.username}</strong> | Senha: <strong className="text-zinc-700">{u.senha || '123'}</strong>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {isManager ? (
                        <span className="text-[10px] text-gray-500 font-mono">Imutável</span>
                      ) : (
                        <button
                          id={`btn-user-toggle-status-${u.id}`}
                          onClick={() => onToggleUserStatus(u.id)}
                          className={`text-[10px] font-bold py-1 px-2.5 rounded transition uppercase tracking-wider ${
                            isActive 
                              ? 'bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20' 
                              : 'bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white border border-green-500/20'
                          }`}
                        >
                          {isActive ? 'Suspender' : 'Reativar'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
