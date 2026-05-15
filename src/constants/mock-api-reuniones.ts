import { faker } from '@faker-js/faker';
import { matchSorter } from 'match-sorter';
import { delay } from './mock-api';

export type Reunion = {
  id: number;
  titulo: string;
  fecha: string;
  hora: string;
  duracion: number;
  participantes: string[];
  resumen: string;
  temas: string[];
  creadoPor: string;
};

export const fakeReuniones = {
  records: [] as Reunion[],

  initialize() {
    const personas = [
      'Martín Olivieri',
      'Laura Juárez',
      'Ignacio Báez',
      'Camila Witt',
      'Sofía Dávila',
      'Tomás Herrera',
      'Valentina Ríos',
      'Facundo Molina',
      'Agustina Paz',
      'Lucas Méndez'
    ];

    for (let i = 1; i <= 15; i++) {
      const numParticipantes = faker.number.int({ min: 2, max: 6 });
      const participantes = faker.helpers.arrayElements(personas, numParticipantes);

      this.records.push({
        id: i,
        titulo: faker.company.catchPhrase(),
        fecha: faker.date.recent({ days: 60 }).toISOString(),
        hora: `${faker.number.int({ min: 8, max: 17 })}:00`,
        duracion: faker.helpers.arrayElement([30, 45, 60, 90, 120]),
        participantes,
        resumen: faker.lorem.paragraph(),
        temas: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () =>
          faker.lorem.sentence()
        ),
        creadoPor: faker.helpers.arrayElement(personas)
      });
    }
  },

  async getReuniones({
    page = 1,
    limit = 10,
    search
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    await delay(400);
    let items = [...this.records];

    if (search) {
      items = matchSorter(items, search, {
        keys: ['titulo', 'resumen', 'temas', 'participantes']
      });
    }

    items.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    const total_items = items.length;
    const offset = (page - 1) * limit;
    const paginated = items.slice(offset, offset + limit);

    return { items: paginated, total_items };
  },

  async getReunionById(id: number) {
    await delay(200);
    return this.records.find((r) => r.id === id) ?? null;
  }
};

fakeReuniones.initialize();
