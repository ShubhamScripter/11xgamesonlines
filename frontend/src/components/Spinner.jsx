import React from "react";

const Spinner = () => {
  return (
    <div className="h-[130px] w-[130px] rounded-[20px] mx-auto flex justify-center items-center 
                    bg-black/60 border-2 border-amber-300 backdrop-blur-sm shadow-lg">
      <svg
        className="h-[80px] w-[120px]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 120 80"
      >
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  
                      0 1 0 0 0  
                      0 0 1 0 0  
                      0 0 0 18 -7"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>

        <g filter="url(#goo)">
          {/* Ball 1 */}
          <circle r="12" cx="30" cy="40" fill="#19A044">
            <animate
              attributeName="cx"
              values="30;90;30"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Ball 2 */}
          <circle r="12" cx="90" cy="40" fill="#19A044">
            <animate
              attributeName="cx"
              values="90;30;90"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </svg>
    </div>
  );
};

export default Spinner;
