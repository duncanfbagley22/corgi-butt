import * as React from "react";
import type { SVGProps } from "react";
const SvgItems = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    data-name="Layer 1"
    viewBox="0 0 24 24"
    {...props}
  >
    <circle cx={12} cy={17} r={6} />
    <path d="M11.383 9.024 7.706 2.653a1 1 0 0 0-1.732 0L0 13h5.074a8.01 8.01 0 0 1 6.309-3.976M13 4v5.062A8.02 8.02 0 0 1 19.747 15H24V4Z" />
  </svg>
);
export default SvgItems;
