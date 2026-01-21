import { useState } from 'react';
import type { Item, Person } from '../types';
import { formatCurrency } from '../utils/calculations';

interface Props {
  items: Item[];
  people: Person[];
  onAddItem: (name: string, unitPrice: number, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onUpdateUnitSplit: (itemId: string, unitId: string, personIds: string[]) => void;
  serviceTax: number;
  onServiceTaxChange: (value: number) => void;
}

export default function ItemsManager({
  items,
  people,
  onAddItem,
  onRemoveItem,
  onUpdateUnitSplit,
  serviceTax,
  onServiceTaxChange,
}: Props) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [taxMode, setTaxMode] = useState<'percentage' | 'fixed'>('percentage');
  const [fixedTaxValue, setFixedTaxValue] = useState(0);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editQuantity, setEditQuantity] = useState(1);

  const handleAdd = () => {
    if (name.trim() && price) {
      onAddItem(name.trim(), parseFloat(price), quantity);
      setName('');
      setPrice('');
      setQuantity(1);
    }
  };

  const startEdit = (item: Item) => {
    setEditingItem(item.id);
    setEditName(item.name);
    setEditPrice(item.unitPrice.toString());
    setEditQuantity(item.units.length);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditName('');
    setEditPrice('');
    setEditQuantity(1);
  };

  const saveEdit = (itemId: string) => {
    if (editName.trim() && editPrice && editQuantity > 0) {
      const newPrice = parseFloat(editPrice);
      if (newPrice > 0) {
        onRemoveItem(itemId);
        onAddItem(editName.trim(), newPrice, editQuantity);
      }
    }
    cancelEdit();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProcessingMessage('Analisando imagem...');

    try {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const base64Image = (reader.result as string).split(',')[1];

          setProcessingMessage('Processando com IA...');

          const response = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=AIzaSyCkXZuQk2hOo_1aZieryubvOHlGzHwOXP4',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `Você é um sistema de extração de itens de notas fiscais de restaurante.

TAREFA: Analisar a imagem da nota fiscal e extrair TODOS os itens com preço e quantidade.

REGRAS IMPORTANTES:
1. Se ver "2x Item R$ 15,00" extraia: {"name":"Item","price":15.00,"quantity":2}
2. Se ver "Item x2 R$ 15,00" extraia: {"name":"Item","price":15.00,"quantity":2}
3. Se ver "Item R$ 15,00" (sem quantidade) extraia: {"name":"Item","price":15.00,"quantity":1}
4. Aceite variações: "2x", "x2", "2 X", "2UN", "02 un", etc
5. INCLUA TODOS OS ITENS: comida, bebida, sobremesa, acompanhamento
6. IGNORE: subtotal, total, taxa de serviço, desconto, gorjeta, linhas vazias
7. Preço sempre em formato numérico (12.50 não "12,50")

RESPONDA APENAS JSON VÁLIDO:
{"items":[{"name":"nome","price":12.50,"quantity":1}]}

EXEMPLOS:
Nota: "2x Coca Cola R$ 7,50"
Resposta: {"items":[{"name":"Coca Cola","price":7.50,"quantity":2}]}

Nota: "Hamburger x3 R$ 32,90"  
Resposta: {"items":[{"name":"Hamburger","price":32.90,"quantity":3}]}

Agora extraia TODOS os itens da imagem. Apenas JSON.`
                      },
                      {
                        inlineData: {
                          mimeType: file.type || 'image/jpeg',
                          data: base64Image
                        }
                      }
                    ]
                  }
                ],
                generationConfig: {
                  temperature: 0.2,
                  maxOutputTokens: 3000,
                }
              })
            }
          );

          if (!response.ok) {
            const err = await response.json();
            console.error('Erro:', err);
            throw new Error(err.error?.message || `Erro ${response.status}`);
          }

          const result = await response.json();
          console.log('IA Response:', result);

          const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!aiText) {
            throw new Error('IA não respondeu');
          }

          console.log('Resposta bruta:', aiText);

          // Parse JSON
          const items: Array<{name: string, price: number, quantity: number}> = [];
          const objectPattern = /\{\s*"name"\s*:\s*"([^"]+)"\s*,\s*"price"\s*:\s*([\d.,]+)\s*(?:,\s*"quantity"\s*:\s*(\d+))?\s*\}/gi;
          
          let match;
          while ((match = objectPattern.exec(aiText)) !== null) {
            const name = match[1]?.trim();
            const priceStr = match[2]?.replace(',', '.');
            const quantity = match[3] ? parseInt(match[3]) : 1;
            const price = parseFloat(priceStr);

            if (name && name.length > 1 && price > 0 && price < 5000 && quantity > 0 && quantity < 100) {
              items.push({ name, price, quantity });
              console.log(`✓ ${quantity}x ${name} - R$ ${price}`);
            }
          }

          if (items.length === 0) {
            throw new Error('Nenhum item encontrado. Tente uma foto mais nítida.');
          }

          setProcessingMessage('Adicionando itens...');

          let addedCount = 0;
          for (const item of items) {
            onAddItem(item.name, item.price, item.quantity);
            addedCount++;
            await new Promise(resolve => setTimeout(resolve, 30));
          }

          console.log(`✅ ${addedCount} itens adicionados`);
          alert(`✓ ${addedCount} item(ns) adicionado(s)!`);
        } catch (error) {
          console.error('Erro:', error);
          alert(`❌ ${error instanceof Error ? error.message : 'Erro ao processar'}`);
        } finally {
          setIsProcessing(false);
          setProcessingMessage('');
          event.target.value = '';
        }
      };

      reader.onerror = () => {
        setIsProcessing(false);
        setProcessingMessage('');
        alert('Erro ao ler arquivo');
        event.target.value = '';
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro:', error);
      setIsProcessing(false);
      setProcessingMessage('');
      alert('Erro ao processar');
      event.target.value = '';
    }
  };

  const togglePerson = (itemId: string, unitId: string, personId: string, currentSplit: string[]) => {
    const newSplit = currentSplit.includes(personId)
      ? currentSplit.filter(id => id !== personId)
      : [...currentSplit, personId];
    onUpdateUnitSplit(itemId, unitId, newSplit);
  };

  return (
    <div className="space-y-6">
      {/* Botão de enviar foto */}
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageUpload}
          disabled={isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          id="receipt-upload"
        />
        <label
          htmlFor="receipt-upload"
          className={`w-full py-4 px-6 border-2 border-dashed rounded-xl
                     font-medium transition-all flex items-center justify-center gap-2 cursor-pointer
                     ${isProcessing 
                       ? 'bg-purple-100 border-purple-400 text-purple-600 cursor-not-allowed' 
                       : 'bg-purple-50 border-purple-300 text-purple-600 hover:bg-purple-100 hover:border-purple-400'
                     }`}
        >
          {isProcessing ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {processingMessage || 'Processando...'}
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Enviar foto da conta
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </>
          )}
        </label>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-slate-500">ou adicione manualmente</span>
        </div>
      </div>

      {/* Formulário de adicionar item */}
      <div className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do item"
          className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-xl
                     text-slate-800 placeholder:text-slate-400 text-base
                     focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10
                     transition-all"
        />
        
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">R$</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0,00"
              step="0.01"
              min="0"
              className="w-full pl-12 pr-5 py-3.5 bg-white border-2 border-slate-200 rounded-xl
                         text-slate-800 placeholder:text-slate-400 text-base
                         focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10
                         transition-all"
            />
          </div>
          
          <div className="flex items-center gap-1 bg-white border-2 border-slate-200 rounded-xl px-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center text-slate-600 
                         hover:bg-purple-50 hover:text-purple-600 rounded-lg text-2xl font-semibold transition-all"
            >
              −
            </button>
            <span className="w-12 text-center font-bold text-slate-800">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 flex items-center justify-center text-slate-600 
                         hover:bg-purple-50 hover:text-purple-600 rounded-lg text-2xl font-semibold transition-all"
            >
              +
            </button>
          </div>
        </div>

        <button
          onClick={handleAdd}
          className="w-full py-4 bg-purple-500 text-white font-semibold rounded-xl text-base
                     hover:bg-purple-600 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Adicionar Item
        </button>
      </div>

      {/* Lista de itens */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
            <p className="font-medium text-slate-500">Nenhum item adicionado ainda</p>
          </div>
        ) : (
          items.map((item) => {
            // Verifica se alguma unidade NÃO foi atribuída a ninguém
            const hasUnallocatedUnits = item.units.some(unit => unit.splitBetween.length === 0);
            
            return (
            <div key={item.id} className={`border-2 rounded-xl overflow-hidden hover:shadow-md transition-all ${
              hasUnallocatedUnits 
                ? 'bg-amber-50 border-amber-200 hover:border-amber-300' 
                : 'bg-white border-slate-100 hover:border-purple-200'
            }`}>
              {/* Header do item */}
              {editingItem === item.id ? (
                // Modo de edição
                <div className="p-4 space-y-3 bg-purple-50">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="Nome do item"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">R$</span>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div className="flex items-center gap-1 bg-white border-2 border-purple-300 rounded-lg px-1">
                      <button
                        onClick={() => setEditQuantity(Math.max(1, editQuantity - 1))}
                        className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg text-xl font-semibold transition-all"
                      >
                        −
                      </button>
                      <span className="w-10 text-center font-bold text-slate-800">{editQuantity}</span>
                      <button
                        onClick={() => setEditQuantity(editQuantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg text-xl font-semibold transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(item.id)}
                      className="flex-1 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-all"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // Modo normal
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-purple-50 transition-colors"
                  onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">{item.name}</h3>
                    <p className="text-sm text-slate-500 truncate mt-0.5">
                      {formatCurrency(item.unitPrice)} × {item.units.length} = 
                      <span className="font-bold text-slate-800 ml-1">
                        {formatCurrency(item.unitPrice * item.units.length)}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); startEdit(item); }}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-all"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemoveItem(item.id); }}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Remover"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <svg 
                      className={`w-5 h-5 text-slate-400 transition-transform ${expandedItem === item.id ? 'rotate-180' : ''}`} 
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Unidades expandidas */}
              {expandedItem === item.id && (
                <div className="px-6 pb-6 pt-5 space-y-6 border-t border-slate-100 bg-slate-50">
                  {item.units.map((unit) => (
                    <div key={unit.id}>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-slate-700">
                          Unidade {unit.unitNumber}
                        </span>
                        <span className="text-xs text-purple-600 bg-purple-100 px-3 py-1 rounded-full font-medium">
                          {unit.splitBetween.length === 0 
                            ? 'Ninguém selecionado' 
                            : `${unit.splitBetween.length} pessoa${unit.splitBetween.length > 1 ? 's' : ''}`}
                        </span>
                      </div>
                      
                      {people.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">Adicione pessoas primeiro</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {people.map((person) => {
                            const isSelected = unit.splitBetween.includes(person.id);
                            return (
                              <button
                                key={person.id}
                                onClick={() => togglePerson(item.id, unit.id, person.id, unit.splitBetween)}
                                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap
                                  ${isSelected 
                                    ? 'text-white shadow-md' 
                                    : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-purple-300'
                                  }`}
                                style={isSelected ? { backgroundColor: person.color } : {}}
                              >
                                {person.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
          })
        )}
      </div>

      {/* Taxa de serviço */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-400 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold">Taxa de Serviço</h3>
            <p className="text-teal-100 text-xs">Opcional - 10% é comum em restaurantes</p>
          </div>
        </div>
        
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTaxMode('percentage')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              taxMode === 'percentage'
                ? 'bg-white text-teal-600 shadow-md' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Percentual
          </button>
          <button
            onClick={() => setTaxMode('fixed')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              taxMode === 'fixed'
                ? 'bg-white text-teal-600 shadow-md' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Valor Fixo
          </button>
        </div>
        
        {taxMode === 'percentage' ? (
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={serviceTax || ''}
              onChange={(e) => onServiceTaxChange(Number(e.target.value) || 0)}
              onFocus={(e) => {
                if (serviceTax === 0) {
                  e.target.select();
                }
              }}
              placeholder="10"
              min="0"
              max="100"
              step="1"
              className="flex-1 px-5 py-4 bg-white/20 border-2 border-white/30 rounded-xl
                         text-white placeholder:text-white/40 font-bold text-center text-2xl
                         focus:outline-none focus:border-white/50 focus:ring-4 focus:ring-white/20
                         transition-all"
            />
            <span className="text-3xl font-bold">%</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold">R$</span>
            <input
              type="number"
              value={fixedTaxValue || ''}
              onChange={(e) => {
                const value = Number(e.target.value) || 0;
                setFixedTaxValue(value);
                // Calcula o total bruto de itens
                const totalBrute = items.reduce((sum, item) => sum + (item.unitPrice * item.units.length), 0);
                // Converte valor fixo para percentual
                if (totalBrute > 0) {
                  const percentualEquivalent = (value / totalBrute) * 100;
                  onServiceTaxChange(percentualEquivalent);
                }
              }}
              onFocus={(e) => {
                if (fixedTaxValue === 0) {
                  e.target.select();
                }
              }}
              placeholder="15,00"
              min="0"
              step="0.01"
              className="flex-1 px-5 py-4 bg-white/20 border-2 border-white/30 rounded-xl
                         text-white placeholder:text-white/40 font-bold text-center text-2xl
                         focus:outline-none focus:border-white/50 focus:ring-4 focus:ring-white/20
                         transition-all"
            />
          </div>
        )}
      </div>
    </div>
  );
}