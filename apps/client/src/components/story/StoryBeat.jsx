import React from "react";

export default function StoryBeat({
  title,
  subtitle,
  description,
  align = "left",
}) {
  return (
    <div className={`story-beat ${align}`}>
      <div className="story-beat-content">
        <p className="story-subtitle">{subtitle}</p>

        <h1 className="story-title">
          {title}
        </h1>

        <p className="story-description">
          {description}
        </p>
      </div>
    </div>
  );
}