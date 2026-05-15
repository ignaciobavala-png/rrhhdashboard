import { faker } from '@faker-js/faker';
import { matchSorter } from 'match-sorter';
import { delay } from './mock-api';

export type LegajoEmpleado = {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  direccion: string;
  fecha_nacimiento: string;
  fecha_ingreso: string;
  puesto: string;
  departamento: string;
  seniority: string;
  salario: number;
  estado: string;
  modalidad: 'presencial' | 'home_office' | 'hibrido';
  avatar: string;
};

const departamentos = [
  'Ingeniería',
  'Diseño',
  'Marketing',
  'Ventas',
  'RRHH',
  'Finanzas',
  'Legal',
  'Operaciones'
];

const puestos: Record<string, string[]> = {
  Ingeniería: ['Desarrollador Frontend', 'Desarrollador Backend', 'DevOps', 'QA', 'Arquitecto'],
  Diseño: ['Diseñador UX', 'Diseñador UI', 'Diseñador Gráfico'],
  Marketing: ['Content Manager', 'SEO', 'Community Manager', 'Analista'],
  Ventas: ['Ejecutivo de Cuentas', 'Sales Manager', 'BDR'],
  RRHH: ['Analista', 'Recruiter Sr', 'HR Business Partner'],
  Finanzas: ['Contador', 'Analista Financiero', 'Tesorero'],
  Legal: ['Abogado', 'Analista Legal'],
  Operaciones: ['Coordinador', 'Analista Operaciones', 'Supervisor']
};

const seniorities = ['Junior', 'Semi Senior', 'Senior', 'Lead', 'Manager'];

const estados = ['Activo', 'Vacaciones', 'Licencia', 'Ausente'];

export const fakeLegajo = {
  records: [] as LegajoEmpleado[],

  initialize() {
    const sample: LegajoEmpleado[] = [];
    for (let i = 1; i <= 50; i++) {
      const depto = faker.helpers.arrayElement(departamentos);
      const puesto = faker.helpers.arrayElement(puestos[depto]);
      const nombre = faker.person.firstName();
      const apellido = faker.person.lastName();
      sample.push({
        id: i,
        nombre,
        apellido,
        dni: faker.string.numeric({ length: 8, allowLeadingZeros: true }),
        email: faker.internet.email({ firstName: nombre, lastName: apellido }),
        telefono: faker.phone.number(),
        direccion: faker.location.streetAddress(),
        fecha_nacimiento: faker.date.birthdate({ min: 22, max: 65, mode: 'age' }).toISOString(),
        fecha_ingreso: faker.date.between({ from: '2018-01-01', to: '2025-12-31' }).toISOString(),
        puesto,
        departamento: depto,
        seniority: faker.helpers.arrayElement(seniorities),
        salario: faker.number.int({ min: 60000, max: 500000 }),
        estado: faker.helpers.arrayElement(estados),
        modalidad: faker.helpers.arrayElement(['presencial', 'home_office', 'hibrido']),
        avatar: `https://api.slingacademy.com/public/sample-users/${i}.png`
      });
    }
    this.records = sample;
  },

  async getEmpleados({
    page = 1,
    limit = 10,
    search,
    sort
  }: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
  }) {
    await delay(600);
    let items = [...this.records];

    if (search) {
      items = matchSorter(items, search, {
        keys: ['nombre', 'apellido', 'dni', 'puesto', 'departamento', 'email']
      });
    }

    if (sort) {
      try {
        const sortItems = JSON.parse(sort) as { id: string; desc: boolean }[];
        if (sortItems.length > 0) {
          const { id, desc } = sortItems[0];
          items.sort((a, b) => {
            const aVal = (a as Record<string, unknown>)[id];
            const bVal = (b as Record<string, unknown>)[id];
            if (typeof aVal === 'number' && typeof bVal === 'number') {
              return desc ? bVal - aVal : aVal - bVal;
            }
            const aStr = String(aVal ?? '').toLowerCase();
            const bStr = String(bVal ?? '').toLowerCase();
            return desc ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
          });
        }
      } catch {
        // ignore
      }
    }

    const total_items = items.length;
    const offset = (page - 1) * limit;
    const paginated = items.slice(offset, offset + limit);

    return { items: paginated, total_items };
  },

  async getEmpleadoById(id: number) {
    await delay(300);
    return this.records.find((e) => e.id === id) ?? null;
  }
};

fakeLegajo.initialize();
