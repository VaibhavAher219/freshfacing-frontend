'use client'

import React from 'react'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function BeforeDashboard() {
  return (
    <div className="freshfacing-welcome">
      <div className="freshfacing-welcome__card">
        <div>
          <h2 className="freshfacing-welcome__greeting">{getGreeting()}</h2>
          <p className="freshfacing-welcome__subtitle">
            Here&apos;s an overview of your businesses and growth.
          </p>
        </div>
        <div className="freshfacing-welcome__accent">
          <svg
            width="24"
            height="24"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="32" height="32" rx="8" fill="transparent" />
            <path
              d="M10 8h12a1 1 0 011 1v0a1 1 0 01-1 1H10a1 1 0 01-1-1v0a1 1 0 011-1z"
              fill="#faf7f2"
            />
            <path
              d="M10 12.5h12a1 1 0 011 1v0a1 1 0 01-1 1H10a1 1 0 01-1-1v0a1 1 0 011-1z"
              fill="#faf7f2"
            />
            <path
              d="M10 17h9a1 1 0 011 1v0a1 1 0 01-1 1h-9a1 1 0 01-1-1v0a1 1 0 011-1z"
              fill="#faf7f2"
              opacity="0.7"
            />
            <rect x="10" y="25" width="8" height="2" rx="1" fill="#e8a830" />
          </svg>
        </div>
      </div>
    </div>
  )
}
