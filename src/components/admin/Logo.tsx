'use client'

import React from 'react'

export default function Logo() {
  return (
    <div className="freshfacing-logo">
      <svg
        className="freshfacing-logo__icon"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="8" fill="#5c7a5c" />
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
        <path
          d="M10 21.5h12a1 1 0 011 1v0a1 1 0 01-1 1H10a1 1 0 01-1-1v0a1 1 0 011-1z"
          fill="#faf7f2"
          opacity="0.5"
        />
        <rect x="10" y="25" width="8" height="2" rx="1" fill="#e8a830" />
      </svg>
      <span className="freshfacing-logo__text">
        FreshFacing
        <span className="freshfacing-logo__badge">Admin</span>
      </span>
    </div>
  )
}
