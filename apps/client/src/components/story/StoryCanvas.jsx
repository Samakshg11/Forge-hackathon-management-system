import React, { forwardRef } from "react";

const StoryCanvas = forwardRef(({ progress }, canvasRef) => {
  return (
    <div className="story-stage">
      <canvas
        ref={canvasRef}
        className="story-canvas"
      />

      <div className="story-gradient" />

      <div className="story-vignette" />
    </div>
  );
});

StoryCanvas.displayName = "StoryCanvas";

export default StoryCanvas;