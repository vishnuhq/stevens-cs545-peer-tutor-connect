/**
 * HelpWidget Component
 * Floating help button with user guide panel
 */

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { HelpCircle, X } from "lucide-react";

const HelpWidget = () => {
  const [open, setOpen] = useState(false);
  const desktopPanelRef = useRef(null);
  const mobilePanelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    // Close panel when clicking outside
    const handleClickOutside = (event) => {
      const desktopEl = desktopPanelRef.current;
      const mobileEl = mobilePanelRef.current;

      if (desktopEl && desktopEl.contains(event.target)) {
        return;
      }

      if (mobileEl && mobileEl.contains(event.target)) {
        return;
      }

      setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Desktop help panel (card above the button)
  const renderDesktopPanel = () => (
    <div
      ref={desktopPanelRef}
      className="hidden md:block fixed right-6 bg-white shadow-xl border border-gray-200 z-40"
      style={{
        bottom: "5.5rem",
        width: "26rem",
        maxWidth: "calc(100vw - 2rem)",
        borderRadius: "0.75rem",
      }}
    >
      {/* Header with Close Button */}
      <div
        className="flex items-center justify-between border-b border-gray-100"
        style={{ padding: "1.25rem" }}
      >
        <h2
          className="font-bold text-gray-900"
          style={{ fontSize: "1.125rem" }}
        >
          How to use Peer-Tutor Connect
        </h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close help guide"
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
          style={{ padding: "0.5rem", borderRadius: "0.5rem" }}
        >
          <X style={{ width: "1.25rem", height: "1.25rem" }} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "1.25rem" }}>
        <ul
          className="text-gray-700 list-disc space-y-2"
          style={{
            paddingLeft: "1.25rem",
            fontSize: "0.9375rem",
            lineHeight: "1.6",
            margin: 0,
          }}
        >
          <li>
            Choose a <strong>course</strong> from "My Courses" to open its
            discussion board.
          </li>
          <li>
            Use <strong>Search</strong> or the <strong>Unanswered</strong>{" "}
            filter to check if your question already exists.
          </li>
          <li>
            Click <strong>Post Question</strong> to describe what you're stuck
            on. Be specific so peers can help faster.
          </li>
          <li>
            On a question page, scroll to <strong>Your Response</strong> to post
            a reply or mark helpful answers.
          </li>
          <li>
            Use <strong>Post anonymously</strong> if you don't want your name
            shown to classmates.
          </li>
          <li>
            Check the <strong>bell icon</strong> for notifications when someone
            responds to your questions.
          </li>
        </ul>

        <div
          className="bg-teal-50 border border-teal-200"
          style={{
            marginTop: "1rem",
            padding: "0.875rem",
            borderRadius: "0.5rem",
          }}
        >
          <p
            className="text-teal-800"
            style={{ fontSize: "0.8125rem", lineHeight: "1.5" }}
          >
            <strong>Tip:</strong> You can reopen this guide anytime using the{" "}
            <strong>?</strong> button in the bottom-right corner.
          </p>
        </div>
      </div>
    </div>
  );

  // Mobile help panel (full-screen overlay)
  const renderMobilePanel = () =>
    createPortal(
      <div
        ref={mobilePanelRef}
        className="md:hidden fixed inset-0 bg-white flex flex-col"
        style={{ zIndex: 9999 }}
      >
        {/* Header with Close Button */}
        <div
          className="flex items-center justify-between bg-gradient-to-r from-teal-600 to-emerald-600 text-white"
          style={{ padding: "1.25rem" }}
        >
          <h3 className="font-bold text-xl">Help Guide</h3>
          <button
            onClick={() => setOpen(false)}
            className="text-white hover:bg-white/20 transition-colors"
            style={{ padding: "0.5rem", borderRadius: "0.5rem" }}
            aria-label="Close help guide"
          >
            <X style={{ width: "1.5rem", height: "1.5rem" }} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
          <div style={{ padding: "1.5rem" }}>
            <h2
              className="font-bold text-gray-900 mb-4"
              style={{ fontSize: "1.125rem" }}
            >
              How to use Peer-Tutor Connect
            </h2>

            <ul
              className="text-gray-700 list-disc space-y-3"
              style={{
                paddingLeft: "1.5rem",
                fontSize: "0.9375rem",
                lineHeight: "1.7",
                margin: 0,
              }}
            >
              <li>
                Choose a <strong>course</strong> from "My Courses" to open its
                discussion board.
              </li>
              <li>
                Use <strong>Search</strong> or the <strong>Unanswered</strong>{" "}
                filter to check if your question already exists.
              </li>
              <li>
                Click <strong>Post Question</strong> to describe what you're
                stuck on. Be specific so peers can help faster.
              </li>
              <li>
                On a question page, scroll to <strong>Your Response</strong> to
                post a reply or mark helpful answers.
              </li>
              <li>
                Use <strong>Post anonymously</strong> if you don't want your
                name shown to classmates.
              </li>
              <li>
                Check the <strong>bell icon</strong> for notifications when
                someone responds to your questions.
              </li>
            </ul>

            <div
              className="bg-teal-50 border border-teal-200"
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                borderRadius: "0.5rem",
              }}
            >
              <p
                className="text-teal-800"
                style={{ fontSize: "0.9375rem", lineHeight: "1.6" }}
              >
                <strong>Tip:</strong> You can reopen this guide anytime using
                the <strong>?</strong> button in the bottom-right corner.
              </p>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <>
      {/* Help panel - desktop or mobile */}
      {open && (
        <>
          {renderDesktopPanel()}
          {renderMobilePanel()}
        </>
      )}

      {/* Floating help button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open help guide"
        className="fixed right-6 bottom-6 w-12 h-12 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white flex items-center justify-center cursor-pointer shadow-xl transition-all z-40"
      >
        <HelpCircle size={20} />
      </button>
    </>
  );
};

export default HelpWidget;
