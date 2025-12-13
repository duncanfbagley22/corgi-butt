export default function Loader({ primaryColor = "#3b82f6", secondaryColor = "#8b5cf6" }) {
  return (
    <div className="flex flex-col items-center gap-6 min-h-screen" style={{ paddingTop: '40vh' }}>
      <div className="relative w-24 h-24">
        <style>
          {`
            @keyframes loaderAnim {
              0% {
                inset: 0 52.5px 52.5px 0;
              }
              12.5% {
                inset: 0 52.5px 0 0;
              }
              25% {
                inset: 52.5px 52.5px 0 0;
              }
              37.5% {
                inset: 52.5px 0 0 0;
              }
              50% {
                inset: 52.5px 0 0 52.5px;
              }
              62.5% {
                inset: 0 0 0 52.5px;
              }
              75% {
                inset: 0 0 52.5px 52.5px;
              }
              87.5% {
                inset: 0 0 52.5px 0;
              }
              100% {
                inset: 0 52.5px 52.5px 0;
              }
            }
            
            .loader-element::before,
            .loader-element::after {
              content: "";
              position: absolute;
              border-radius: 50px;
              animation: loaderAnim 2.5s infinite;
            }
            
            .loader-element::before {
              background-color: ${primaryColor};
            }
            
            .loader-element::after {
              background-color: ${secondaryColor};
              animation-delay: -1.25s;
            }
          `}
        </style>
        <div className="loader-element w-full h-full relative"></div>
      </div>
      <div className="text-white text-2xl font-bold font-[Poppins] tracking-wide">
        LOADING
      </div>
    </div>
  );
}