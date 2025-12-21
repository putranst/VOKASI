'use client';

/**
 * @deprecated Use IRISStepper instead.
 * This component is maintained for backward compatibility.
 * CDIOStepper now maps to IRISStepper with the NUSA Framework's IRIS Cycle.
 * 
 * CDIO → IRIS Mapping:
 * - Conceive → Immersion
 * - Design → Reflection  
 * - Implement → Iteration
 * - Operate → Scale
 */

import IRISStepper from './IRISStepper';
export default IRISStepper;

// Re-export with legacy name for any named imports
export { IRISStepper as CDIOStepper };
