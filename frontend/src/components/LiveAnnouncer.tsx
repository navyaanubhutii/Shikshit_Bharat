import React from 'react';

interface LiveAnnouncerProps {
  message?: string;
  assertiveMessage?: string;
}

export const LiveAnnouncer: React.FC<LiveAnnouncerProps> = ({ message, assertiveMessage }) => {
  return (
    <>
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="a11y-polite-announcer"
      >
        {message}
      </div>
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        id="a11y-assertive-announcer"
      >
        {assertiveMessage}
      </div>
    </>
  );
};
