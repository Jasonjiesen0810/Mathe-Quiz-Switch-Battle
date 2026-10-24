// Mutable values shared between GSAP (DOM side) and the R3F render loop,
// kept outside React so scroll updates never trigger re-renders.
export const heroState = {
  progress: 0, // 0 at top of hero, 1 once the hero has scrolled away
};
