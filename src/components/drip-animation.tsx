export const DripAnimation = () => {
  return (
    <div className="drip-wrapper">
      <div className="drip-top"></div>
      <div className="drip animate-drip-1 delay-[0.5s]"></div>
      <div className="drip animate-drip-2 delay-[2s]"></div>
      <div className="drip animate-drip-3 delay-[1s]"></div>
      <div className="drip animate-drip-4 delay-[1.75s]"></div>
      <div className="drip animate-drip-1 delay-[2.25s]"></div>
      <div className="drip animate-drip-2 delay-[1.5s]"></div>
      <div className="drip animate-drip-3 delay-[1s]"></div>
      <div className="drip animate-drip-4 delay-[0.75s]"></div>
      <div className="drip-bottom"></div>
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
      <defs>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </defs>
    </svg>
    </div>
  )
}