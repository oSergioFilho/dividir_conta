import { useState } from 'react';
import type { Person } from '../types';

interface Props {
  people: Person[];
  onAddPerson: (name: string) => void;
  onRemovePerson: (id: string) => void;
}

export default function PeopleManager({ people, onAddPerson, onRemovePerson }: Props) {
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (name.trim()) {
      onAddPerson(name.trim());
      setName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="space-y-5">
      {/* Input para adicionar */}
      <div className="flex gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nome da pessoa"
          className="flex-1 px-5 py-3.5 bg-white border-2 border-slate-200 rounded-xl
                     text-slate-800 placeholder:text-slate-400 text-base
                     focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10
                     transition-all"
        />
        <button
          onClick={handleAdd}
          className="w-14 h-14 bg-teal-500 text-white font-medium rounded-xl text-base
                     hover:bg-teal-600 active:scale-95 transition-all shadow-lg flex items-center justify-center"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
          </svg>
        </button>
      </div>

      {/* Lista de pessoas */}
      <div className="space-y-3">
        {people.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <p className="font-medium text-slate-500">Nenhuma pessoa adicionada ainda</p>
          </div>
        ) : (
          people.map((person) => (
            <div
              key={person.id}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-slate-100
                         hover:border-teal-200 hover:shadow-sm transition-all group"
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center 
                           text-white font-bold text-base shadow-sm"
                style={{ backgroundColor: person.color }}
              >
                {person.name.charAt(0).toUpperCase()}
              </div>
              <span className="flex-1 font-semibold text-slate-800">{person.name}</span>
              <button
                onClick={() => onRemovePerson(person.id)}
                className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center
                           text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
