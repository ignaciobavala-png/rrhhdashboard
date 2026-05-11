import { faker } from '@faker-js/faker';
import { matchSorter } from 'match-sorter';
import { delay } from './mock-api';

export type Celular = {
  id: number;
  empleado: string;
  empleadoId: number;
  modelo: string;
  numero: string;
  imei: string;
  plan: string;
  estado: 'asignado' | 'disponible' | 'baja';
  fecha_asignacion: string;
};

const modelos = [
  'iPhone 15 Pro',
  'iPhone 15',
  'Samsung Galaxy S24',
  'Samsung Galaxy S24 Ultra',
  'Motorola Edge 50',
  'Xiaomi 14',
  'Google Pixel 8',
  'iPhone 14',
  'Samsung Galaxy A55',
  'Motorola G84'
];

const planes = ['Prepago', 'Postpago Básico', 'Postpago Premium', 'Corporativo'];

export const fakeFlota = {
  records: [] as Celular[],

  initialize() {
    const empleados = [
      'Martín Olivieri',
      'Laura Juárez',
      'Ignacio Báez',
      'Camila Witt',
      'Sofía Dávila',
      'Tomás Herrera',
      'Valentina Ríos',
      'Facundo Molina',
      'Agustina Paz',
      'Lucas Méndez',
      'Florencia Díaz',
      'Nicolás Ferreyra'
    ];

    for (let i = 1; i <= 20; i++) {
      const idx = i - 1;
      this.records.push({
        id: i,
        empleado: idx < empleados.length ? empleados[idx] : 'Disponible',
        empleadoId: idx < empleados.length ? i : 0,
        modelo: faker.helpers.arrayElement(modelos),
        numero: faker.phone.number(),
        imei: faker.string.numeric({ length: 15 }),
        plan: faker.helpers.arrayElement(planes),
        estado: idx < 16 ? 'asignado' : faker.helpers.arrayElement(['disponible', 'baja']),
        fecha_asignacion: faker.date.between({ from: '2023-01-01', to: '2025-12-31' }).toISOString()
      });
    }
  },

  async getCelulares({
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
        keys: ['empleado', 'modelo', 'numero', 'imei', 'plan']
      });
    }

    const total_items = items.length;
    const offset = (page - 1) * limit;
    const paginated = items.slice(offset, offset + limit);

    return { items: paginated, total_items };
  }
};

fakeFlota.initialize();
