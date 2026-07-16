# Uso del editor

[Volver al índice](README.md)

## Abrir una plantilla

1. Ejecuta `pnpm dev`.
2. Abre `http://localhost:3000/editor`.
3. Expande las categorías de la barra lateral.
4. Selecciona una plantilla.

La URL refleja la ubicación de la plantilla. Por ejemplo:

```text
/editor/redes-sociales/instagram/promocion-cuadrada
```

Puedes guardar o compartir esa URL dentro de la misma instalación.

## Editar el contenido

El panel **Contenido** se construye desde el archivo `config.ts` de la plantilla. Los cambios aparecen inmediatamente en la vista previa.

Los controles disponibles son:

| Tipo | Uso |
| --- | --- |
| `text` | Texto corto. |
| `textarea` | Títulos o párrafos extensos. |
| `url` | Rutas locales o URLs de imágenes. |
| `color` | Selector y valor hexadecimal. |
| `number` | Valores numéricos con límites opcionales. |

## Restablecer

Pulsa **Restablecer** para volver a los valores definidos en `config.defaults`. Los cambios del editor no modifican archivos del proyecto.

## Descargar PNG

Pulsa **Descargar PNG**. La aplicación espera a que las fuentes estén listas, captura la plantilla a su tamaño real y descarga el archivo indicado por `config.fileName`.

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
