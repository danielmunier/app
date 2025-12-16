import GalaxyBackground from "./GalaxyBackground";
import StarsBackground from "./StarsBackground";

// Background types available:
// - "galaxy" (Three.js animated spiral galaxy)
// - "stars" (Canvas 2D stars with shooting stars)
const BACKGROUND_TYPE = "stars";

export default function Background() {
  switch (BACKGROUND_TYPE) {
    case "galaxy":
      return <GalaxyBackground />;
    case "stars":
      return <StarsBackground />;
    default:
      return <GalaxyBackground />;
  }
}
