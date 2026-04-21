import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Task {
  Id: number;
  Title: string;
  Status: 'Pending' | 'Completed';
  IsDeleted: number;
}

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

const UNIMED_GREEN = '#00995D';

function Dashboard() {
  const [activeTab, setActiveTab] = useState<'kata2' | 'kata3' | 'kata4'>('kata2');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [isLoading, setIsLoading] = useState(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/tasks', { params: { status: filter } });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await api.post('/tasks', { title: newTaskTitle });
      setNewTaskTitle('');
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.Status === 'Pending' ? 'Completed' : 'Pending';
    try {
      await api.patch(`/tasks/${task.Id}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const total = tasks.length;
  const pending = tasks.filter((t) => t.Status === 'Pending').length;
  const completed = tasks.filter((t) => t.Status === 'Completed').length;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* SIDEBAR CORPORATIVA */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col shadow-sm z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div
            className="w-8 h-8 rounded-lg mr-3 flex items-center justify-center text-white"
            style={{ backgroundColor: UNIMED_GREEN }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight" style={{ color: UNIMED_GREEN }}>
            Unimed<span className="text-slate-800 font-bold">Dash</span>
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-400 mb-4 tracking-wider uppercase">Menu Principal</div>
          
          <button
            onClick={() => setActiveTab('kata2')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'kata2'
                ? 'shadow-sm ring-1 ring-slate-200/50 bg-emerald-50'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
            style={{ color: activeTab === 'kata2' ? UNIMED_GREEN : '' }}
          >
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Demandas (Kata 2)
          </button>
          
          <button
            onClick={() => setActiveTab('kata4')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'kata4'
                ? 'shadow-sm ring-1 ring-slate-200/50 bg-emerald-50'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
            style={{ color: activeTab === 'kata4' ? UNIMED_GREEN : '' }}
          >
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Dados (Kata 4)
          </button>

          <button
            onClick={() => setActiveTab('kata3')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'kata3'
                ? 'shadow-sm ring-1 ring-slate-200/50 bg-emerald-50'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
            style={{ color: activeTab === 'kata3' ? UNIMED_GREEN : '' }}
          >
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
            </svg>
            Arquitetura (Kata 3)
          </button>
        </nav>

        <div className="p-4 border-t border-slate-200/50 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-lg" style={{ backgroundColor: UNIMED_GREEN }}>
              C
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Candidato Sênior</p>
              <p className="text-xs text-slate-500 font-medium">admin@unimed.coop.br</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50/80">
        
        {/* TOP HEADER */}
        <header className="h-16 bg-white border-b border-slate-200/60 flex items-center justify-between px-6 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight hidden sm:block">Central de Gestão (Tech Challenge)</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-bold text-slate-600">Sistema Conectado (SQLite)</span>
          </div>
        </header>

        {/* SCROLLABLE AREA */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {activeTab === 'kata2' && (
            <>
              {/* KPI WIDGETS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Geral</p>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                  </div>
                  <p className="text-4xl font-black text-slate-800">{total}</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Aguardando</p>
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                  </div>
                  <p className="text-4xl font-black text-slate-800">{pending}</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Concluídas</p>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                  </div>
                  <p className="text-4xl font-black text-emerald-600">{completed}</p>
                </div>
              </div>

              <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
                
                {/* TAREFA RÁPIDA (LADO ESQUERDO) */}
                <div className="xl:w-1/3">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
                    <div className="p-6 border-b border-slate-100">
                      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Nova Inserção
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">Crie um registro na base de dados conectada por API.</p>
                    </div>
                    <form onSubmit={handleCreateTask} className="p-6 flex flex-col gap-5 bg-slate-50/50">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Descrição / Título</label>
                        <input 
                          type="text" 
                          className="w-full bg-white border-slate-300 border rounded-xl px-4 py-3 placeholder:text-slate-400 focus:ring-2 focus:outline-none transition-shadow text-slate-800 shadow-sm"
                          style={{ '--tw-ring-color': UNIMED_GREEN } as any}
                          placeholder="Ex: Revisar arquitetura do BD..."
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={!newTaskTitle.trim()}
                        className="w-full text-white font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none hover:shadow-lg" 
                        style={{ backgroundColor: newTaskTitle.trim() ? UNIMED_GREEN : '' }}
                      >
                        Gravar no Banco +
                      </button>
                    </form>
                  </div>
                </div>

                {/* TABELA DE DADOS (LADO DIREITO) */}
                <div className="xl:w-2/3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                  {/* Table Header & Filters */}
                  <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-slate-800">Visualização de Registros</h2>
                    <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200">
                      {(['All', 'Pending', 'Completed'] as const).map(f => {
                        const isActive = filter === f;
                        return (
                          <button 
                            key={f} 
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                              isActive 
                                ? 'bg-white shadow-sm ring-1 ring-slate-200 text-emerald-700' 
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                            style={{ color: isActive ? UNIMED_GREEN : '' }}
                          >
                            {f === 'All' ? 'Histórico' : f === 'Pending' ? 'Em Fila' : 'Resolvido'}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Table Content */}
                  <div className="flex-1 overflow-auto bg-slate-50/30">
                    {isLoading ? (
                      <div className="p-16 flex justify-center items-center">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
                      </div>
                    ) : tasks.length === 0 ? (
                      <div className="px-6 py-20 text-center flex flex-col items-center">
                        <div className="bg-slate-100 p-5 rounded-full mb-4 shadow-inner">
                          <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <p className="text-slate-800 font-bold text-lg">Tabela Vazia</p>
                        <p className="text-slate-500 text-sm mt-1 max-w-sm">Nenhum registro corresponde a este filtro. Use o formulário à esquerda.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200/80 bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500">
                            <th className="px-6 py-4">Sinalizador</th>
                            <th className="px-6 py-4">ID de Sistema / Descrição</th>
                            <th className="px-6 py-4 text-center">Ações de Admin</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {tasks.map(task => {
                            const isDone = task.Status === 'Completed';
                            return (
                              <tr key={task.Id} className="hover:bg-slate-50/80 transition-colors group">
                                
                                <td className="px-6 py-4 whitespace-nowrap w-40">
                                  <button 
                                    onClick={() => handleToggleStatus(task)}
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
                                      isDone 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                        : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                    }`}
                                  >
                                    <span className={`w-2 h-2 rounded-full shadow-sm ${isDone ? 'bg-emerald-500' : 'bg-amber-500 hover:animate-ping'}`}></span>
                                    {isDone ? 'Concluído' : 'Processando'}
                                  </button>
                                </td>

                                <td className="px-6 py-4">
                                  <p className="text-xs text-slate-400 font-bold tracking-widest mb-1">
                                    REG-{task.Id.toString().padStart(4, '0')}
                                  </p>
                                  <p className={`font-bold text-base transition-all ${
                                    isDone ? 'line-through text-slate-400' : 'text-slate-800'
                                  }`}>
                                    {task.Title}
                                  </p>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <button 
                                    onClick={() => handleDeleteTask(task.Id)}
                                    className="text-slate-300 hover:text-white bg-white hover:bg-red-500 border border-slate-200 hover:border-red-500 rounded-xl p-2.5 transition-all shadow-sm active:scale-95 mx-auto"
                                    title="Excluir Permatentemente (Soft Delete)"
                                  >
                                    <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </td>
                                
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'kata4' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center flex flex-col items-center">
              <div className="bg-blue-50 p-6 rounded-full mb-6 relative">
                 <svg className="w-16 h-16 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                 </svg>
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-3">Engenharia de Dados (Kata 4)</h2>
              <p className="text-slate-500 max-w-xl text-lg mb-8">
                O Pipeline de ETL em Python (Pandas) está finalizado e localizado fisicamente no repositório.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full text-left">
                <div className="border border-slate-200 p-4 rounded-xl">
                  <h4 className="font-bold text-slate-700 mb-1">Arquivos Gerados</h4>
                  <p className="text-sm font-mono text-slate-500 truncate">kata-4/pipeline.py</p>
                  <p className="text-sm font-mono text-slate-500 truncate">kata-4/clean_patients.csv</p>
                </div>
                <div className="border border-slate-200 p-4 rounded-xl">
                  <h4 className="font-bold text-slate-700 mb-1">Próximos Passos</h4>
                  <p className="text-sm text-slate-500">Execute o arquivo diretamente via terminal usando: <br/><code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-600 font-bold">python pipeline.py</code></p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'kata3' && (
             <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center flex flex-col items-center">
             <div className="bg-purple-50 p-6 rounded-full mb-6 relative">
                 <svg className="w-16 h-16 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
                 </svg>
             </div>
             <h2 className="text-3xl font-black text-slate-800 mb-3">Modernização de Arquitetura (Kata 3)</h2>
             <p className="text-slate-500 max-w-xl text-lg mb-8">
               A proposta de evolução do monolito para microserviços, utilizando <i>Strangler Fig Pattern</i>, está documentada.
             </p>
             
             <div className="flex flex-col gap-4 max-w-2xl w-full text-left">
               <div className="border border-slate-200 p-5 rounded-xl border-l-4 border-l-purple-500">
                 <h4 className="font-bold text-slate-800 text-lg mb-2">Entregáveis Concluídos:</h4>
                 <ul className="space-y-2 text-slate-600">
                   <li className="flex items-center gap-2">
                     <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                     Documento Oficial: <code className="text-sm font-bold ml-1">kata-3/PLANO.md</code>
                   </li>
                   <li className="flex items-center gap-2">
                     <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                     Mermaid Diagrams System Design
                   </li>
                   <li className="flex items-center gap-2">
                     <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                     Análise Crítica e Matriz de Eishenhower
                   </li>
                 </ul>
               </div>
             </div>
           </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default Dashboard;