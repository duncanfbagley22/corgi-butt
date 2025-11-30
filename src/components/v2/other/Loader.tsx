interface LoaderProps {
  primaryColor?: string;
  secondaryColor?: string;
}

export default function Loader({ 
  primaryColor = '#3FB8AF',
  secondaryColor = '#FF3D7F'
}: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <style>{`
        .loader {
          width: 48px;
          aspect-ratio: 1;
          background: ${primaryColor};
          position: relative;
          animation: loader-flip 2.5s infinite linear alternate;
        }
        
        .loader:before {
          content: "";
          position: absolute;
          inset: 0;
          background: ${secondaryColor};
          transform: translate(100%);
          transform-origin: top left;
          animation: loader-rotate 0.5s infinite alternate;
        }
        
        @keyframes loader-flip {
          0%, 19.9%,
          80%, 100% {
            transform: scale(1, 1);
          }
          20%, 39.9% {
            transform: scale(-1, 1);
          }
          40%, 59.9% {
            transform: scale(-1, -1);
          }
          60%, 79.9% {
            transform: scale(1, -1);
          }
        }
        
        @keyframes loader-rotate {
          0%, 20% {
            transform: translate(100%) rotate(0);
          }
          80%, 100% {
            transform: translate(100%) rotate(-180deg);
          }
        }

        .loading-text {
          margin-top: 3rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: #fff;
          letter-spacing: 0.05em;
        }
      `}</style>
      
      <div className="loader" role="status" aria-label="Loading"></div>
      <div className="loading-text">Loading...</div>
    </div>
  );
}