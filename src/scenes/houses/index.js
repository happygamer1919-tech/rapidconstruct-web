/**
 * House model registry. Adding a model: create `<id>.js` exporting
 * { id, site, walls, roof, fence } (see cu-fronton.js) and register it here;
 * then list the id in `HOUSE_MODELS` (src/config/configurator.ts) so the UI
 * offers it. The engine never changes.
 */
import { CU_FRONTON } from './cu-fronton';

export const HOUSES = {
  'cu-fronton': CU_FRONTON,
};
