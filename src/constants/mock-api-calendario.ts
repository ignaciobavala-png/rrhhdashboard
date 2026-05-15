import { faker } from '@faker-js/faker';
import { delay } from './mock-api';

export type EventoCalendario = {
  id: number;
  fecha: string;
  titulo: string;
  tipo: 'licencia' | 'sueldo' | 'estudio' | 'ausencia';
  empleado: string;
  empleadoId: number;
  descripcion: string;
};

export const fakeCalendario = {
  records: [] as EventoCalendario[],

  initialize() {
    const eventos: EventoCalendario[] = [];
    const empleados = [
      'Martín Olivieri',
      'Laura Juárez',
      'Ignacio Báez',
      'Camila Witt',
      'Sofía Dávila',
      'Tomás Herrera',
      'Valentina Ríos',
      'Facundo Molina'
    ];

    const tipos: EventoCalendario['tipo'][] = ['licencia', 'sueldo', 'estudio', 'ausencia'];

    let id = 1;
    for (let mes = 0; mes < 3; mes++) {
      for (let i = 0; i < 15; i++) {
        const dia = faker.number.int({ min: 1, max: 28 });
        const fecha = new Date(2026, 4 + mes, dia);
        const tipo = faker.helpers.arrayElement(tipos);

        const descripciones: Record<string, string> = {
          licencia: 'Licencia por',
          sueldo: 'Pago de sueldo -',
          estudio: 'Día de estudio -',
          ausencia: 'Ausencia justificada'
        };

        eventos.push({
          id: id++,
          fecha: fecha.toISOString(),
          titulo: `${descripciones[tipo]} ${faker.helpers.arrayElement(['personal', 'médica', 'familiar', 'examen', 'capacitación', ''])}`,
          tipo,
          empleado: faker.helpers.arrayElement(empleados),
          empleadoId: faker.number.int({ min: 1, max: 50 }),
          descripcion: faker.lorem.sentence()
        });
      }
    }

    this.records = eventos;
  },

  async getEventos({ mes, anio }: { mes: number; anio: number }) {
    await delay(300);
    const eventos = this.records.filter((e) => {
      const d = new Date(e.fecha);
      return d.getMonth() === mes && d.getFullYear() === anio;
    });
    return eventos;
  },

  async getEventosDelMes() {
    await delay(200);
    return this.records;
  }
};

fakeCalendario.initialize();
