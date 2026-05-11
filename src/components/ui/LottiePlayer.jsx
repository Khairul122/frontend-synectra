import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

export function LottiePlayer({ animationData, style, className }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !animationData) return;

    const anim = lottie.loadAnimation({
      container:     containerRef.current,
      renderer:      'svg',
      loop:          true,
      autoplay:      true,
      animationData,
    });

    return () => anim.destroy();
  }, [animationData]);

  return <div ref={containerRef} style={style} className={className} />;
}
