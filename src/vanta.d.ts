declare module "vanta/dist/vanta.net.min" {
  interface VantaEffect {
    destroy(): void;
  }
  type VantaNetFn = (options: Record<string, unknown>) => VantaEffect;
  const NET: VantaNetFn | { default: VantaNetFn };
  export default NET;
}
