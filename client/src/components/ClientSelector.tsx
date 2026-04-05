import { useState, useEffect } from 'react';
import api from '../api/axios';
import { User, Check, UserPlus, Loader2 } from 'lucide-react';

interface Client {
  id: string;
  name: string;
}

export const ClientSelector = ({ onSelect }: { onSelect: (id: string) => void }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Client[]>([]);
  const [selectedName, setSelectedName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      // Solo buscamos si hay más de 2 letras y no hemos seleccionado a nadie ya
      if (query.length > 2 && !selectedName) {
        try {
          const res = await api.get<Client[]>(`/clients/search?query=${query}`);
          setResults(res.data);
        } catch (error) {
          console.error("Error buscando clientes", error);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedName]);

  // FUNCIÓN PARA CREAR CLIENTE AL INSTANTE
const handleCreateQuickClient = async () => {
  setLoading(true);
  try {
    // IMPORTANTE: Asegúrate de que la ruta coincida con tu backend
    const res = await api.post<Client>('/clients', { 
      name: query.toUpperCase() 
    });
    
    onSelect(res.data.id);
    setSelectedName(res.data.name);
    setResults([]);
  } catch (error: unknown) {
    // Esto te dirá exactamente qué campo está fallandoif
    if (error instanceof Error) {
      console.error("Error al crear el cliente:", error.message);
    }
    alert(`Error "Revisa la consola"`);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="relative w-full">
      <div className="relative">
        <User className="absolute left-3 top-3 text-slate-500" size={18} />
        <input
          placeholder="Escribe nombre del cliente..."
          className="w-full bg-slate-900 border border-slate-700 p-3 pl-10 rounded-xl text-white outline-none focus:border-orange-500 transition-colors"
          value={selectedName || query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedName('');
          }}
        />
        {loading && <Loader2 className="absolute right-3 top-3 text-orange-500 animate-spin" size={18} />}
      </div>

      {/* LISTA DE RESULTADOS O REGISTRO RÁPIDO */}
      {(results.length > 0 || (query.length > 2 && !selectedName && !loading)) && (
        <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
          {results.length > 0 ? (
            <ul>
              {results.map((client) => (
                <li
                  key={client.id}
                  onClick={() => {
                    onSelect(client.id);
                    setSelectedName(client.name);
                    setResults([]);
                  }}
                  className="p-3 hover:bg-orange-500/20 cursor-pointer flex justify-between items-center text-sm border-b border-slate-700/50 last:border-0 text-slate-200"
                >
                  <span className="font-medium">{client.name}</span>
                  <Check size={14} className="text-orange-500" />
                </li>
              ))}
            </ul>
          ) : (
            /* BOTÓN DE ACCIÓN RÁPIDA CUANDO NO HAY COINCIDENCIAS */
            <div className="p-2 bg-slate-800">
              <p className="text-[10px] text-slate-500 mb-2 px-2 uppercase font-black tracking-widest">
                Cliente no encontrado
              </p>
              <button
                type="button"
                onClick={handleCreateQuickClient}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 text-[#070B14] font-black py-2 rounded-lg text-xs hover:bg-orange-400 transition-all shadow-lg"
              >
                <UserPlus size={14} />
                CREAR "{query.toUpperCase()}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};