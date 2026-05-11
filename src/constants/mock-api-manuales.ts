import { faker } from '@faker-js/faker';
import { matchSorter } from 'match-sorter';
import { delay } from './mock-api';

export type Manual = {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  autor: string;
  fecha_actualizacion: string;
  version: string;
  archivo: string;
  tamano: string;
};

const categorias = [
  'RRHH',
  'Seguridad',
  'Calidad',
  'Procesos',
  'TI',
  'Marketing',
  'Ventas',
  'Finanzas'
];

export const fakeManuales = {
  records: [] as Manual[],

  initialize() {
    for (let i = 1; i <= 12; i++) {
      this.records.push({
        id: i,
        titulo: `Manual de ${faker.company.buzzNoun()}`,
        descripcion: faker.lorem.sentence(),
        categoria: faker.helpers.arrayElement(categorias),
        autor: faker.person.fullName(),
        fecha_actualizacion: faker.date.recent({ days: 180 }).toISOString(),
        version: `${faker.number.int({ min: 1, max: 5 })}.${faker.number.int({ min: 0, max: 9 })}`,
        archivo: `${faker.string.alphanumeric(10)}.pdf`,
        tamano: `${faker.number.int({ min: 100, max: 5000 })} KB`
      });
    }
  },

  async getManuales({
    page = 1,
    limit = 10,
    search,
    categoria
  }: {
    page?: number;
    limit?: number;
    search?: string;
    categoria?: string;
  }) {
    await delay(400);
    let items = [...this.records];

    if (categoria) {
      items = items.filter((m) => m.categoria === categoria);
    }

    if (search) {
      items = matchSorter(items, search, {
        keys: ['titulo', 'descripcion', 'categoria', 'autor']
      });
    }

    const total_items = items.length;
    const offset = (page - 1) * limit;
    const paginated = items.slice(offset, offset + limit);

    return { items: paginated, total_items };
  },

  async getManualById(id: number) {
    await delay(200);
    return this.records.find((m) => m.id === id) ?? null;
  }
};

fakeManuales.initialize();
