import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Polymorphic magnetic hover control. Pass `as={Link}` to wrap a router link,
 * or leave it as a plain button. The pull is intentionally subtle (0.22) and
 * critically damped so it reads as a precise, weighted control rather than a
 * bouncy toy — the difference between "premium" and "template".
 */
export function MagneticButton({ as = 'button', children, className = '', onClick, ...props }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const MotionComponent = useMemo(() => motion(as), [as]);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x: x * 0.22, y: y * 0.22 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <MotionComponent
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 22, mass: 0.4 }}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}
