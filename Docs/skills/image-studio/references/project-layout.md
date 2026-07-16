# Estructura del proyecto

[Volver al skill](../SKILL.md)

## Archivos editables

```text
src/templates/
└── categoría/
    ├── _folder.json
    └── subcategoría/
        ├── _folder.json
        └── nombre-plantilla/
            ├── config.ts
            └── template.tsx

public/
├── images/
├── logos/
└── fonts/
```

Una plantilla termina en la primera carpeta que contiene `config.ts`. No coloques plantillas hijas dentro de ella.

## Slugs y rutas

Cada segmento admite:

```text
a-z 0-9 -
```

La ubicación:

```text
src/templates/documentos/cotizacion/config.ts
```

genera las dos rutas con el mismo slug:

```text
/es/editor/documentos/cotizacion
/en/editor/documentos/cotizacion
```

El prefijo controla el idioma de la interfaz. El idioma del diseño se elige dentro del editor y no cambia el slug.

## Categorías

`_folder.json` es opcional:

```json
{
  "order": 10,
  "translations": {
    "es": { "title": "Redes sociales" },
    "en": { "title": "Social media" }
  }
}
```

Usa intervalos de diez para permitir inserciones futuras. Si se omite, el nombre de la carpeta se convierte en un título sin traducción; añade el archivo cuando la categoría sea visible.

## Archivos generados

El script crea:

```text
src/generated/template-registry.ts
src/generated/template-config-registry.ts
```

No los edites. `template-registry.ts` carga componentes en el cliente y `template-config-registry.ts` carga configuraciones en el servidor.

## Dónde continuar

- Para escribir `config.ts`, lee [Configuración tipada](template-config.md).
- Para construir el componente, lee [Diseño y recursos](design-and-assets.md).
- Para comprobar el resultado, lee [Flujo y verificación](workflow-and-verification.md).
