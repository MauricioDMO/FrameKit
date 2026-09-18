---
title: Contribuir a FrameKit
description: Oriéntate en el repositorio de FrameKit antes de modificar el runtime, Studio, la CLI, la generación de código o la documentación.
---

# Contribuir a FrameKit

Esta sección está dirigida a quienes mejoran FrameKit. Ofrece la orientación necesaria antes de modificar el runtime reutilizable, Studio, la CLI de creación de proyectos, la generación de código o el sitio de documentación.

## Empieza por la estructura del repositorio

FrameKit mantiene el runtime y el editor destinados a consumidores en `packages/framekit`, la lógica de scaffolding y el proyecto generado en `packages/create-framekit`, el Studio de primera parte en `apps/studio` y este sitio de documentación en `apps/docs`.

## Elige el recorrido del cambio

Trabaja en el área responsable del comportamiento que necesitas modificar y verifica el resultado con sus comprobaciones. Los cambios que afectan a consumidores generados o al comportamiento de los paquetes públicos también deben comprobarse desde la perspectiva del consumidor, no solo dentro del repositorio.

Las guías posteriores documentarán los flujos detallados de desarrollo, pruebas y publicación de cada área.
