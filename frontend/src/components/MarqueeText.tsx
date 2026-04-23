import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MarqueeTextProps {
  text: string;
  className?: string;
  containerClassName?: string;
}

const MarqueeText = ({ text, className = "", containerClassName = "" }: MarqueeTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        setIsOverflowing(textRef.current.scrollWidth > containerRef.current.clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  return (
    <div ref={containerRef} className={`overflow-hidden whitespace-nowrap ${containerClassName}`}>
      <motion.p
        ref={textRef}
        animate={isOverflowing ? { x: [0, -(textRef.current?.scrollWidth! - containerRef.current?.clientWidth!) - 20, 0] } : { x: 0 }}
        transition={{
          duration: isOverflowing ? text.length * 0.2 : 0,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 2
        }}
        className={`inline-block ${className}`}
      >
        {text}
      </motion.p>
    </div>
  );
};

export default MarqueeText;
