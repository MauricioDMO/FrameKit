# Uso del editor

[Volver al índice](README.md)

## Abrir una plantilla

1. Ejecuta `pnpm dev`.
2. Abre `http://localhost:3000`.
3. Expande las categorías de la barra lateral.
4. Selecciona una plantilla.

La URL refleja la ubicación de la plantilla. Por ejemplo:

```text
/es/editor/redes-sociales/instagram/promocion-cuadrada
```

Puedes guardar o compartir esa URL.

## Idiomas

- **Idioma de la interfaz** está en la barra lateral. Cambia la URL, navegación, botones y etiquetas del formulario. Conserva el idioma y los cambios del diseño actual durante la sesión.
- **Idioma del diseño** es el primer control del formulario. No cambia la URL; carga título, descripción, etiquetas, placeholders, valores iniciales, textos fijos del PNG y nombre de descarga del idioma elegido.

Al abrir una plantilla por primera vez, el diseño usa el idioma de la interfaz. Cambiar **Idioma del diseño** reinicia el lienzo con los valores de ese idioma.

## Editar el contenido

El panel **Contenido** se construye desde el archivo `config.ts` de la plantilla. Los cambios aparecen inmediatamente en la vista previa.

Los controles disponibles son:

| Tipo | Uso |
| --- | --- |
| `text` | Texto corto con negrita, cursiva y tachado opcionales. |
| `textarea` | Títulos o párrafos extensos; además admite saltos de línea y listas cuando la plantilla los renderiza. |
| `url` | Rutas locales o URLs de imágenes. |
| `color` | Selector y valor hexadecimal. |
| `number` | Valores numéricos con límites opcionales. |

Consulta [Markdown en campos de texto](markdown.md) para ver la sintaxis disponible. El formato aparece en el PNG solo cuando la plantilla usa el componente `Markdown` para ese campo.

## Restablecer

Pulsa **Restablecer** para volver a los valores definidos en `config.content[idiomaDelDiseño]`. Los cambios del editor no modifican archivos del proyecto.

## Descargar PNG

Pulsa **Descargar PNG**. La aplicación espera a que las fuentes estén listas, captura la plantilla a su tamaño real y descarga el archivo indicado por `config.metadata[idiomaDelDiseño].fileName`.

La escala visible de la vista previa no cambia la resolución final. Una plantilla de `1080 × 1080` genera un PNG de `1080 × 1080`.

## Imágenes externas

Prefiere recursos dentro de `public/`, por ejemplo:

```text
public/images/products/item.webp
```

Y úsalos como:

```text
/images/products/item.webp
```

Una imagen remota puede impedir la exportación si su servidor no permite CORS. Consulta [Solución de problemas](troubleshooting.md#la-exportación-png-falla).
