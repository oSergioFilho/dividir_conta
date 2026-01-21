import { useState } from 'react';
import type { PersonBill, Person } from '../types';
import { formatCurrency } from '../utils/calculations';

interface Props {
  personBills: PersonBill[];
  people: Person[];
  totalBill: number;
}

export default function BillSummary({ personBills, people, totalBill }: Props) {
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);
  if (people.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
        </svg>
        <p className="font-medium text-slate-500">Adicione pessoas e itens</p>
        <p className="text-sm text-slate-400">O resultado aparecerá aqui</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Total geral */}
      <div className="bg-slate-100 rounded-2xl p-6 text-center border-2 border-slate-200">
        <p className="text-slate-500 text-sm mb-2">Total da Conta</p>
        <p className="text-5xl font-black text-slate-800">{formatCurrency(totalBill)}</p>
      </div>

      {/* Lista por pessoa */}
      <div className="space-y-3">
        {personBills.length === 0 ? (
          <div className="text-center py-6 text-slate-400">
            <p className="text-sm">Atribua itens às pessoas</p>
          </div>
        ) : (
          personBills.map((bill) => {
            const person = people.find(p => p.id === bill.personId);
            if (!person) return null;

            const isExpanded = expandedPerson === bill.personId;

            return (
              <div key={bill.personId} className="bg-white rounded-xl border-2 border-slate-100 overflow-hidden">
                <div 
                  onClick={() => setExpandedPerson(isExpanded ? null : bill.personId)}
                  className="flex items-center justify-between gap-4 p-5
                             hover:border-orange-200 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center 
                                 text-white font-bold text-lg shadow-sm"
                      style={{ backgroundColor: person.color }}
                    >
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{person.name}</h3>
                      <p className="text-sm text-slate-500">
                        {bill.items.length} {bill.items.length === 1 ? 'item' : 'itens'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-black text-orange-600">
                      {formatCurrency(bill.total)}
                    </div>
                    <svg 
                      className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Detalhes expandidos */}
                {isExpanded && (
                  <div className="border-t-2 border-slate-100 bg-slate-50 p-5 space-y-3">
                    {bill.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="flex-1">
                          <span className="font-medium text-slate-700">{item.itemName}</span>
                          <span className="text-sm text-slate-500 ml-2">({item.fraction})</span>
                        </div>
                        <span className="font-bold text-slate-800">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                    
                    {/* Subtotal e taxa */}
                    <div className="pt-3 border-t border-slate-200 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Subtotal</span>
                        <span className="font-semibold text-slate-700">{formatCurrency(bill.subtotal)}</span>
                      </div>
                      {bill.serviceTax > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Taxa de serviço</span>
                          <span className="font-semibold text-slate-700">{formatCurrency(bill.serviceTax)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base pt-2 border-t border-slate-300">
                        <span className="font-bold text-slate-800">Total</span>
                        <span className="font-black text-orange-600">{formatCurrency(bill.total)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Verificação */}
      {personBills.length > 0 && (
        <div className="flex justify-between items-center p-5 bg-teal-50 rounded-xl border-2 border-teal-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-bold text-teal-700">Soma das partes:</span>
          </div>
          <span className="font-black text-teal-600 text-xl">{formatCurrency(totalBill)}</span>
        </div>
      )}
    </div>
  );
}
