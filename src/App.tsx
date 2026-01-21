import { useState } from 'react';
import type { Bill, Person, Item, ItemUnit } from './types';
import { calculatePersonBills, getRandomColor, formatCurrency } from './utils/calculations';
import PeopleManager from './components/PeopleManager';
import ItemsManager from './components/ItemsManager';
import BillSummary from './components/BillSummary';

function App() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [people, setPeople] = useState<Person[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [serviceTax, setServiceTax] = useState<number>(10);

  const handleAddPerson = (name: string) => {
    const newPerson: Person = {
      id: Date.now().toString(),
      name,
      color: getRandomColor(),
    };
    setPeople([...people, newPerson]);
  };

  const handleRemovePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
    setItems(items.map(item => ({
      ...item,
      units: item.units.map(unit => ({
        ...unit,
        splitBetween: unit.splitBetween.filter(personId => personId !== id),
      })),
    })));
  };

  const handleAddItem = (name: string, unitPrice: number, quantity: number) => {
    const units: ItemUnit[] = Array.from({ length: quantity }, (_, index) => ({
      id: `${Date.now()}-${Math.random()}-${index}`,
      unitNumber: index + 1,
      splitBetween: [],
    }));

    const newItem: Item = {
      id: `${Date.now()}-${Math.random()}`,
      name,
      unitPrice,
      units,
    };
    setItems((prevItems) => [...prevItems, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleUpdateUnitSplit = (itemId: string, unitId: string, personIds: string[]) => {
    setItems(items.map(item => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        units: item.units.map(unit => {
          if (unit.id !== unitId) return unit;
          return { ...unit, splitBetween: personIds };
        }),
      };
    }));
  };

  const bill: Bill = { items, people, serviceTax };
  const personBills = calculatePersonBills(bill);
  const totalBill = personBills.reduce((sum, pb) => sum + pb.total, 0);

  // Calcula o total bruto (sem divisão)
  const totalBrute = items.reduce((sum, item) => sum + (item.unitPrice * item.units.length), 0);
  
  // Calcula o total já alocado para pessoas (sem taxa)
  const totalAllocated = personBills.reduce((sum, pb) => sum + pb.subtotal, 0);
  
  // Calcula o valor faltando distribuir
  const remainingValue = totalBrute - totalAllocated;

  // Calcula as taxas
  const totalTaxAmount = (totalBrute * serviceTax) / 100;
  const allocatedTaxAmount = (totalAllocated * serviceTax) / 100;

  // Totais com taxa incluída
  const totalBruteWithTax = totalBrute + totalTaxAmount;
  const totalAllocatedWithTax = totalAllocated + allocatedTaxAmount;
  const remainingValueWithTax = remainingValue + ((totalBrute - totalAllocated) * serviceTax / 100);

  const canGoToStep2 = people.length > 0;
  const canGoToStep3 = items.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header com Steps */}
      <header className="bg-slate-50 px-6 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center">
            {/* Steps */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentStep(1)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  currentStep === 1 
                    ? 'bg-teal-500 text-white shadow-md' 
                    : currentStep > 1 
                      ? 'bg-teal-100 text-teal-600' 
                      : 'bg-slate-200 text-slate-400'
                }`}
              >
                1
              </button>
              <div className={`w-8 h-0.5 ${currentStep > 1 ? 'bg-teal-300' : 'bg-slate-200'}`} />
              <button
                onClick={() => canGoToStep2 && setCurrentStep(2)}
                disabled={!canGoToStep2}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  currentStep === 2 
                    ? 'bg-purple-500 text-white shadow-md' 
                    : currentStep > 2 
                      ? 'bg-purple-100 text-purple-600' 
                      : 'bg-slate-200 text-slate-400'
                }`}
              >
                2
              </button>
              <div className={`w-8 h-0.5 ${currentStep > 2 ? 'bg-purple-300' : 'bg-slate-200'}`} />
              <button
                onClick={() => canGoToStep3 && setCurrentStep(3)}
                disabled={!canGoToStep3}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  currentStep === 3 
                    ? 'bg-orange-500 text-white shadow-md' 
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                3
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Step 1: Pessoas */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-teal-500 to-teal-400 rounded-2xl p-8 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Quem está na conta?</h2>
                  <p className="text-teal-100 text-sm">Adicione todas as pessoas</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <PeopleManager
                people={people}
                onAddPerson={handleAddPerson}
                onRemovePerson={handleRemovePerson}
              />
            </div>

            {people.length > 0 && (
              <button
                onClick={() => setCurrentStep(2)}
                className="w-full bg-slate-900 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                Próximo: Adicionar Itens
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Step 2: Itens */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-500 to-purple-400 rounded-2xl p-8 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">O que foi pedido?</h2>
                  <p className="text-purple-100 text-sm">Adicione os itens ou envie uma foto da conta</p>
                </div>
              </div>
            </div>

            {/* Card de progresso */}
            {items.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-purple-600 font-medium">Total Bruto</p>
                    <p className="text-xl font-bold text-purple-700">{formatCurrency(totalBruteWithTax)}</p>
                    <p className="text-xs text-purple-500 mt-1">{formatCurrency(totalBrute)} + {formatCurrency(totalTaxAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 font-medium">Já Distribuído</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(totalAllocatedWithTax)}</p>
                    <p className="text-xs text-green-500 mt-1">{formatCurrency(totalAllocated)} + {formatCurrency(allocatedTaxAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 font-medium">Faltando</p>
                    <p className={`text-xl font-bold ${remainingValueWithTax > 0.01 ? 'text-orange-600' : 'text-green-600'}`}>
                      {formatCurrency(remainingValueWithTax)}
                    </p>
                    <p className={`text-xs mt-1 ${remainingValueWithTax > 0.01 ? 'text-orange-500' : 'text-green-500'}`}>
                      {formatCurrency(remainingValue)} + {formatCurrency((remainingValue * serviceTax) / 100)}
                    </p>
                  </div>
                </div>
                
                {/* Barra de progresso */}
                <div className="w-full bg-purple-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full transition-all ${remainingValueWithTax > 0.01 ? 'bg-green-500' : 'bg-green-600'}`}
                    style={{ width: `${totalBruteWithTax > 0 ? (totalAllocatedWithTax / totalBruteWithTax) * 100 : 0}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-purple-600 font-medium">
                  <span>{items.length} item{items.length !== 1 ? 's' : ''} + {serviceTax}% taxa</span>
                  <span>{remainingValueWithTax > 0.01 ? `${Math.round((totalAllocatedWithTax / totalBruteWithTax) * 100)}%` : '✓ Completo'}</span>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <ItemsManager
                items={items}
                people={people}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
                onUpdateUnitSplit={handleUpdateUnitSplit}
                serviceTax={serviceTax}
                onServiceTaxChange={setServiceTax}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex-1 bg-white border-2 border-slate-300 text-slate-700 py-4 px-6 rounded-xl font-semibold text-lg hover:bg-slate-50 transition-all"
              >
                Voltar
              </button>
              {items.length > 0 && (
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 bg-slate-900 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-slate-800 transition-all shadow-lg"
                >
                  Ver Resultado
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Resultado */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl p-8 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Resultado Final</h2>
                  <p className="text-orange-100 text-sm">Quanto cada pessoa deve pagar</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <BillSummary 
                personBills={personBills} 
                people={people} 
                totalBill={totalBill} 
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex-1 bg-white border-2 border-slate-300 text-slate-700 py-4 px-6 rounded-xl font-semibold text-lg hover:bg-slate-50 transition-all"
              >
                Voltar
              </button>
              <button
                onClick={() => {
                  setPeople([]);
                  setItems([]);
                  setServiceTax(10);
                  setCurrentStep(1);
                }}
                className="flex-1 bg-teal-500 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-teal-600 transition-all shadow-lg"
              >
                Nova Conta
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
