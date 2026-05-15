import { faker } from '@faker-js/faker';
import { delay } from './mock-api';

export type Evaluacion = {
  id: number;
  empleadoId: number;
  empleado: string;
  puesto: string;
  fecha: string;
  tipo: 'desempeño' | 'objetivos' | 'feedback' | 'promoción';
  puntaje: number;
  estado: 'pendiente' | 'completada' | 'reprogramada';
  revisadoPor: string;
  comentarios: string;
};

export type Objetivo = {
  id: number;
  empleadoId: number;
  empleado: string;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  progreso: number;
  estado: 'en_curso' | 'completado' | 'cancelado';
  prioridad: 'baja' | 'media' | 'alta';
};

export const fakeTalento = {
  evaluaciones: [] as Evaluacion[],
  objetivos: [] as Objetivo[],

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
      'Lucas Méndez'
    ];
    const puestos = [
      'Desarrollador Senior',
      'Diseñadora UX',
      'Project Manager',
      'Contadora',
      'RRHH',
      'DevOps',
      'Marketing',
      'Ventas',
      'Backend',
      'Frontend'
    ];
    const tipos: Evaluacion['tipo'][] = ['desempeño', 'objetivos', 'feedback', 'promoción'];
    const estados: Evaluacion['estado'][] = ['pendiente', 'completada', 'reprogramada'];

    for (let i = 1; i <= 25; i++) {
      this.evaluaciones.push({
        id: i,
        empleadoId: faker.number.int({ min: 1, max: 50 }),
        empleado: faker.helpers.arrayElement(empleados),
        puesto: faker.helpers.arrayElement(puestos),
        fecha: faker.date.between({ from: '2025-01-01', to: '2026-06-01' }).toISOString(),
        tipo: faker.helpers.arrayElement(tipos),
        puntaje: faker.number.int({ min: 1, max: 10 }),
        estado: faker.helpers.arrayElement(estados),
        revisadoPor: faker.person.fullName(),
        comentarios: faker.lorem.paragraph()
      });
    }

    for (let i = 1; i <= 20; i++) {
      this.objetivos.push({
        id: i,
        empleadoId: faker.number.int({ min: 1, max: 50 }),
        empleado: faker.helpers.arrayElement(empleados),
        titulo: faker.company.catchPhrase(),
        descripcion: faker.lorem.sentence(),
        fechaInicio: faker.date.past().toISOString(),
        fechaFin: faker.date.future().toISOString(),
        progreso: faker.number.int({ min: 0, max: 100 }),
        estado: faker.helpers.arrayElement(['en_curso', 'completado', 'cancelado'] as const),
        prioridad: faker.helpers.arrayElement(['baja', 'media', 'alta'] as const)
      });
    }
  },

  async getEvaluaciones() {
    await delay(400);
    return this.evaluaciones;
  },

  async getObjetivos() {
    await delay(400);
    return this.objetivos;
  },

  async getResumenTalento() {
    await delay(300);
    const completadas = this.evaluaciones.filter((e) => e.estado === 'completada').length;
    const pendientes = this.evaluaciones.filter((e) => e.estado === 'pendiente').length;
    const promedio =
      this.evaluaciones
        .filter((e) => e.estado === 'completada')
        .reduce((acc, e) => acc + e.puntaje, 0) / completadas || 0;
    const objetivosCompletados = this.objetivos.filter((o) => o.estado === 'completado').length;

    return {
      completadas,
      pendientes,
      promedio: Math.round(promedio * 10) / 10,
      objetivosCompletados
    };
  }
};

fakeTalento.initialize();
