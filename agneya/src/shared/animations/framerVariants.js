// src/shared/animations/framerVariants.js

export const pageTransition = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
    filter: "blur(10px)"
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] // Custom smooth easing
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    filter: "blur(10px)",
    transition: {
      duration: 0.4,
      ease: "anticipate"
    }
  }
};

// Gravity Scroll Variant emphasizing a heavy drop-in effect with smooth fluid physics
export const gravityScrollVariant = {
  hidden: { 
    opacity: 0, 
    y: 60,
    scale: 0.97,
    filter: "blur(5px)"
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      mass: 0.8,
      damping: 20,
      stiffness: 80,
      restDelta: 0.001
    }
  }
};

// For staggered children with gravity
export const staggeredGravityContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05
    }
  }
};

// Hover and Tap variants for highly interactive elements
export const interactiveHover = {
  hover: {
    scale: 1.04,
    y: -3,
    boxShadow: "0px 15px 30px rgba(156, 81, 182, 0.3)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  },
  tap: {
    scale: 0.97,
    y: 0,
    boxShadow: "0px 4px 10px rgba(156, 81, 182, 0.1)",
  }
};

// Slide in from left/right
export const slideInVariant = (direction) => ({
  hidden: {
    x: direction === "left" ? "-100%" : "100%",
    opacity: 0
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 70, damping: 20 }
  }
});