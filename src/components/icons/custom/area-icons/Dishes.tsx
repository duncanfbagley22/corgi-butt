import * as React from "react";
import type { SVGProps } from "react";
const SvgDishes = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    data-name="Layer 1"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    {...props}
  >
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.223 3.342 9.654 8 11.303V15h-.5A2.503 2.503 0 0 1 5 12.5V7h2v5.5a.5.5 0 0 0 .5.5H8V7h2v6h.5a.5.5 0 0 0 .5-.5V7h2v5.5c0 1.378-1.122 2.5-2.5 2.5H10v8.82c.652.11 1.317.18 2 .18 1.405 0 2.747-.254 4-.697v-4.509c-1.529-1.861-2.037-3.756-1.998-5.462.121-3.077 1.666-5.25 2.606-6.102.535-.497 1.388-.122 1.392.507v14.645c3.583-2.076 6-5.942 6-10.381C24 5.373 18.627 0 12 0" />
  </svg>
);
export default SvgDishes;
