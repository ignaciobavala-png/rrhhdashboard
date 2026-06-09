# Sistema de Formularios

> **Referencia completa:** Ver `docs/forms.md`
> **Archivos clave:** `src/components/ui/form-context.tsx`, `src/components/ui/tanstack-form.tsx`

---

## Resumen

El sistema de formularios usa **TanStack Form v1** con **Zod v4** para validación y **Shadcn UI** para los componentes visuales.

---

## Conceptos Clave

- **3 patrones de uso:** `useFormFields<T>()` (recomendado), `form.AppField` render props, import directo
- **Estructura recomendada:** schema (`schemas/*.ts`) + opciones (`constants/*.ts`) + form UI (`components/*.tsx`)
- **8 field types:** TextField, TextareaField, SelectField, CheckboxField, SwitchField, RadioGroupField, SliderField, FileUploadField
- **Validación:** `onBlur` (feedback instantáneo) + `onChangeAsync` (server checks) + `onSubmit` (catch-all)
- **Side effects:** `listeners` para resetear campos dependientes, sincronizar valores

---

## Quick Start

```tsx
'use client';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import * as z from 'zod';

const schema = z.object({
  name: z.string().min(2, 'Requerido'),
  email: z.string().email('Email inválido')
});

type FormValues = z.infer<typeof schema>;

const form = useAppForm({
  defaultValues: { name: '', email: '' } as FormValues,
  validators: { onSubmit: schema },
  onSubmit: ({ value }) => console.log(value)
});

const { FormTextField } = useFormFields<FormValues>();

<form.AppForm>
  <form.Form>
    <FormTextField name="name" label="Nombre" required
      validators={{ onBlur: z.string().min(2, 'Requerido') }} />
    <FormTextField name="email" label="Email" required type="email"
      validators={{ onBlur: z.string().email('Email inválido') }} />
    <form.SubmitButton label="Guardar" />
  </form.Form>
</form.AppForm>
```

---

## Archivos Clave

| Archivo | Contenido |
|---------|-----------|
| `src/components/ui/tanstack-form.tsx` | `useAppForm`, `useFormFields`, `Form`, `SubmitButton`, `withForm`, `withFieldGroup` |
| `src/components/ui/form-context.tsx` | Contextos, `createFormField`, `FormFieldSet`, `FormField`, `FormFieldError`, `scrollToFirstError` |
| `src/components/forms/fields/*.tsx` | 8 field components (base + composed variants) |
| `src/components/forms/fields/index.tsx` | Barrel re-exports |

---

## Para Más Detalle

Ver [docs/forms.md](../forms.md) con:
- 3 patrones de uso detallados
- 8 field types con ejemplos
- Validación (sync, async, linked, cross-field)
- Recetas: CRUD, Sheet/Dialog, Wizard, Arrays, Dependent Dropdowns
- Type safety reference