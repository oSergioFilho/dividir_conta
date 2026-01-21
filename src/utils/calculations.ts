import type { Bill, PersonBill } from '../types';

export const calculatePersonBills = (bill: Bill): PersonBill[] => {
  const { items, people, serviceTax } = bill;
  
  // Inicializa as contas de cada pessoa
  const personBills: PersonBill[] = people.map(person => ({
    personId: person.id,
    personName: person.name,
    items: [],
    subtotal: 0,
    serviceTax: 0,
    total: 0,
  }));

  // Calcula o valor de cada unidade para cada pessoa
  items.forEach(item => {
    item.units.forEach(unit => {
      const splitCount = unit.splitBetween.length;
      if (splitCount === 0) return;

      const valuePerPerson = item.unitPrice / splitCount;

      unit.splitBetween.forEach(personId => {
        const personBill = personBills.find(pb => pb.personId === personId);
        if (!personBill) return;

        // Verifica se já existe esse item na conta da pessoa
        const existingItem = personBill.items.find(i => i.itemName === item.name);
        
        if (existingItem) {
          // Incrementa a fração existente
          const [currentNum, currentDen] = existingItem.fraction.split('/').map(Number);
          const newNum = currentNum + 1;
          existingItem.fraction = `${newNum}/${currentDen}`;
          existingItem.amount += valuePerPerson;
        } else {
          // Adiciona novo item
          personBill.items.push({
            itemName: item.name,
            fraction: `1/${splitCount}`,
            amount: valuePerPerson,
          });
        }

        personBill.subtotal += valuePerPerson;
      });
    });
  });

  // Calcula taxa de serviço e total
  personBills.forEach(pb => {
    pb.serviceTax = (pb.subtotal * serviceTax) / 100;
    pb.total = pb.subtotal + pb.serviceTax;
  });

  return personBills;
};

export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const getRandomColor = (): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
