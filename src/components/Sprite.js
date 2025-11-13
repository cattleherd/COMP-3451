import React, { useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet } from 'react-native';

// --- Constants ---
const SPRITE_WIDTH = 100;
const SPRITE_HEIGHT = 100;

// number of frames 
const FRAMES = 3;
const ANIMATION_SPEED = 150; // 200ms per frame
const loopCount = 3 // loop twice per animation


/**
 * This works by superimposing the spritesheet inside the
 * viewport container with overflow hidden
 *
 * Shifting the spritesheet horizontal position gives the
 * illusion of animation
 */
const Sprite = ({
  spriteSheet,
  isAnimating,
  spriteSheetBack,
  direction,
  onAnimationComplete
}) => {
  // the frame to show
  const [currentFrame, setCurrentFrame] = useState(0);
  
  // 'useRef' is used to store values that don't need to trigger a re-render
  const loopCountRef = useRef(0); // track how many times the animation has looped
  const animationTimerRef = useRef(null); // this is used to replay the animation through recursive loop

  // this runs the animation automatically
  // it checks the isAnimating prop to start/stops the animation
  // the isAnimating prop is passed from parent, so when sprite is at desired tile location
  // then the isAnimating prop should be set to false, which triggers this effect to stop the animation
  useEffect(() => {
    if (isAnimating) {
      startAnimation();
    } else {
      stopAnimation();
    }

    // cleanup, runs on unmount
    return () => stopAnimation();
  }, [isAnimating]); // Re-run if any of these props change

  // ------- helper functions ---------

  const startAnimation = () => {
    
    if (animationTimerRef.current) return; // prevent multiple animation instances running, since stopAnimation() clears the timeout timer

    loopCountRef.current = 0; // reset loop counter for every new animation

    // 'animate' is a function that calls itself repeatedly using setTimeout
    const animate = () => {
      setCurrentFrame((prevFrame) => {
        // switch to the next frame, where % wraps around to 0
        // (0 + 1) % 3 = 1
        // (1 + 1) % 3 = 2
        // (2 + 1) % 3 = 0 
        const nextFrame = (prevFrame + 1) % FRAMES;

        // next frame becomes 0 after a full cycle (full loop)
        if (nextFrame === 0) {
          loopCountRef.current += 1; // increase loop counter
          
          // after set number of loops, stop animation
          if (loopCountRef.current >= loopCount) {
            stopAnimation(); 
            onAnimationComplete?.(); // Call the complete callback if it exists
          }
        }
        return nextFrame; // update state to the next frame
      });

      // recursive function call, to call the animate() function again after ANIMATION_SPEED ms
      animationTimerRef.current = setTimeout(animate, ANIMATION_SPEED);
    };

    // start animation loop
    animate();
  };

  const stopAnimation = () => {
    // clear the timer ref and reset to null (prevent memory leak while stopping animation)
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }
  };


  // moves sprite sheet to the left
  const spriteStyles = {
    // width of sprite sheet is sprite width * Frames
    width: SPRITE_WIDTH * FRAMES,
    height: SPRITE_HEIGHT,
    // use transform to advance the sprite frame
    // -currentFrame * SPRITE_WIDTH:
    // Frame 0: translateX(0)
    // Frame 1: translateX(-100)
    // Frame 2: translateX(-200)
    // since spritesheet will be absolute positioned to parent, its left justified,
    // so we use negative transform to slide the sheet to the left
    transform: [{ translateX: -currentFrame * SPRITE_WIDTH }],
  };

  //  sprite sheet to show based on the direction passed from parent
  const sourceImage = direction === 'back' ? spriteSheetBack : spriteSheet;

  return (
    <View style={styles.container}>
      <Image
        source={sourceImage}
        style={[styles.spriteSheet, spriteStyles]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // viewport (only show 1 frame at a time)
  container: {
    width: SPRITE_WIDTH,
    height: SPRITE_HEIGHT,
    overflow: 'hidden',
  },
  spriteSheet: {
    position: 'absolute',
  },
});

export default Sprite;