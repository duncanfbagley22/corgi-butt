import * as React from "react";
import type { SVGProps } from "react";
const SvgBook = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    data-name="Layer 1"
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M24 3v17.611L12 24.04 0 20.611V4c0-.95.435-1.823 1.194-2.395.249-.188.523-.316.806-.418v17.916l10 2.857 10-2.857V.187c.283.102.558.23.806.418A2.97 2.97 0 0 1 24 3m-11 .371v14.263l-1 .286-1-.286V3.371C11 2.039 10.105.852 8.749.468L7.08.069A2.5 2.5 0 0 0 4 2.501v15.213L12 20l8-2.286V2.535A2.5 2.5 0 0 0 16.963.093l-1.788.393a3.01 3.01 0 0 0-2.176 2.885Z" />
  </svg>
);
export default SvgBook;
