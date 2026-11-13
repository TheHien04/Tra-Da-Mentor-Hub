/**
 * Stable public API surface.
 *
 * Domain implementations live in `services/api/`; keeping this barrel avoids
 * coupling components to the internal file layout.
 */
export * from './api/index';
export { default } from './api/index';
