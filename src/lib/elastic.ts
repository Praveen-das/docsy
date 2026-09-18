/**
 * Elastic physics and easing utility module.
 * Provides high-performance spring dynamics (damped harmonic oscillator)
 * and classic elastic easing functions for UI interactions.
 */

export interface ElasticSpringConfig {
  /** Spring stiffness (higher = faster snap). Default: 150 */
  stiffness?: number;
  /** Damping coefficient (controls oscillation decay). Default: 13 */
  damping?: number;
  /** Mass of the oscillating body. Default: 1 */
  mass?: number;
  /** Precision threshold for settling detection. Default: 0.0005 */
  precision?: number;
}

/**
 * 2nd-order damped harmonic oscillator spring solver.
 * Handles continuous velocity handoff, mid-flight interruptions,
 * and authentic physical elasticity without CSS transform jitter.
 */
export class ElasticSpring {
  public current: number;
  public target: number;
  public velocity: number = 0;

  public stiffness: number;
  public damping: number;
  public mass: number;
  public precision: number;

  constructor(initialValue: number = 1, config: ElasticSpringConfig = {}) {
    this.current = initialValue;
    this.target = initialValue;
    this.stiffness = config.stiffness ?? 150;
    this.damping = config.damping ?? 13;
    this.mass = config.mass ?? 1;
    this.precision = config.precision ?? 0.0005;
  }

  /**
   * Sets a new destination value. If motion is already in progress,
   * current velocity is preserved for a seamless physical handoff.
   */
  public setTarget(newTarget: number): void {
    this.target = newTarget;
  }

  /**
   * Immediately resets current value and target to a fixed position,
   * zeroing out any residual velocity.
   */
  public reset(value: number): void {
    this.current = value;
    this.target = value;
    this.velocity = 0;
  }

  /**
   * Advances the physics simulation by delta time (dt in seconds).
   * Uses sub-stepped semi-implicit Euler integration for unconditional stability.
   */
  public update(dt: number): number {
    if (this.isSettled) {
      this.current = this.target;
      this.velocity = 0;
      return this.current;
    }

    // Clamp dt to avoid explosion after browser tab switches
    const dtClamped = Math.min(Math.max(dt, 0.0001), 0.064);

    // Sub-step to ensure high numerical precision and stability
    const maxSubStep = 0.008;
    const steps = Math.ceil(dtClamped / maxSubStep);
    const subDt = dtClamped / steps;

    for (let i = 0; i < steps; i++) {
      const displacement = this.current - this.target;
      const springForce = -this.stiffness * displacement;
      const dampingForce = -this.damping * this.velocity;
      const totalForce = springForce + dampingForce;
      const acceleration = totalForce / this.mass;

      this.velocity += acceleration * subDt;
      this.current += this.velocity * subDt;
    }

    // Settle threshold
    if (
      Math.abs(this.current - this.target) < this.precision &&
      Math.abs(this.velocity) < this.precision
    ) {
      this.current = this.target;
      this.velocity = 0;
    }

    return this.current;
  }

  public get value(): number {
    return this.current;
  }

  public get isSettled(): boolean {
    return (
      Math.abs(this.current - this.target) < this.precision &&
      Math.abs(this.velocity) < this.precision
    );
  }
}

/**
 * Standard Robert Penner elastic ease-out curve.
 * @param t Progress between 0 and 1.
 * @param amplitude Initial bounce amplitude. Default: 1.0.
 * @param period Oscillation period in seconds. Default: 0.3.
 */
export function elasticEaseOut(t: number, amplitude = 1, period = 0.3): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;

  const s = (period / (2 * Math.PI)) * Math.asin(1 / amplitude);
  return (
    amplitude * Math.pow(2, -10 * t) * Math.sin(((t - s) * (2 * Math.PI)) / period) + 1
  );
}

/**
 * Standard Robert Penner elastic ease-in-out curve.
 */
export function elasticEaseInOut(t: number, amplitude = 1, period = 0.45): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;

  const scaledT = t * 2;
  const s = (period / (2 * Math.PI)) * Math.asin(1 / amplitude);

  if (scaledT < 1) {
    const p = scaledT - 1;
    return (
      -0.5 *
      (amplitude * Math.pow(2, 10 * p) * Math.sin(((p - s) * (2 * Math.PI)) / period))
    );
  }

  const p = scaledT - 1;
  return (
    amplitude *
      Math.pow(2, -10 * p) *
      Math.sin(((p - s) * (2 * Math.PI)) / period) *
      0.5 +
    1
  );
}

export const elasticjs = {
  ElasticSpring,
  elasticEaseOut,
  elasticEaseInOut,
};

export default elasticjs;
