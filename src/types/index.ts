export interface Person {
  id: string;
  name: string;
  color: string;
}

export interface ItemUnit {
  id: string;
  unitNumber: number; // Ex: 1, 2, 3, 4 para 4 unidades
  splitBetween: string[]; // IDs das pessoas que dividem esta unidade específica
}

export interface Item {
  id: string;
  name: string;
  unitPrice: number; // Preço unitário
  units: ItemUnit[]; // Array de unidades individuais
}

export interface Bill {
  items: Item[];
  people: Person[];
  serviceTax: number; // Porcentagem (ex: 10 para 10%)
}

export interface PersonBill {
  personId: string;
  personName: string;
  items: {
    itemName: string;
    fraction: string; // Ex: "1/4" quando dividido entre 4 pessoas
    amount: number;
  }[];
  subtotal: number;
  serviceTax: number;
  total: number;
}
