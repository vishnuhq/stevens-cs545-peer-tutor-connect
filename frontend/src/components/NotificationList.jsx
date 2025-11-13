/**
 * Notification List Component
 * Dropdown list of recent notifications
 */

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { notificationsApi } from "../api/api";
import { formatDistanceToNow } from "date-fns";
import { CheckCheck, Inbox, X } from "lucide-react";
import Spinner from "./Spinner";

const NotificationList = ({ onClose, onCountChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  //const dropdownRef = useRef(null);

  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {

      const desktopEl = desktopDropdownRef.current;
      const mobileEl = mobileDropdownRef.current;

      if (desktopEl && desktopEl.contains(event.target)) {
        return;
      }

      // If click happened inside mobile menu, ignore
      if (mobileEl && mobileEl.contains(event.target)) {
        return;
      }

      // Otherwise, it's truly "outside"
      onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsApi.getNotifications(false); // Get all
      const fetchedNotifications = response.data.notifications || [];
      setNotifications(fetchedNotifications);

      // Update unread count
      const unreadCount =
        fetchedNotifications.filter((n) => !n.isRead).length || 0;
      onCountChange(unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.isRead) {
        await notificationsApi.markAsRead(notification._id);
      }

      // Close the notification panel first
      onClose();

      // Navigate to question
      navigate(`/questions/${notification.questionId}`);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      // Still navigate even if marking as read fails
      onClose();
      navigate(`/questions/${notification.questionId}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      // Refresh the notification list
      await fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  // Mobile menu content - wrapped in a function to ensure fresh renders
  const renderMobileMenu = () => (
    <div
      //ref={dropdownRef}
      ref={mobileDropdownRef}
      className="md:hidden fixed inset-0 bg-white flex flex-col"
      style={{ zIndex: 9999 }}
    >
      {/* Header with Close Button */}
      <div
        className="flex items-center justify-between bg-gradient-to-r from-teal-600 to-emerald-600 text-white"
        style={{ padding: "1.25rem" }}
      >
        <h3 className="font-bold text-xl">Notifications</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-white hover:bg-white/20 transition-colors"
          style={{ padding: "0.5rem", borderRadius: "0.5rem" }}
          aria-label="Close notifications"
        >
          <X style={{ width: "1.5rem", height: "1.5rem" }} />
        </button>
      </div>

      {/* Mark all as read - Mobile */}
      {notifications.some((n) => !n.isRead) && (
        <div className="border-b border-gray-200" style={{ padding: "1rem" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMarkAllAsRead();
            }}
            className="w-full flex items-center justify-center bg-teal-50 hover:bg-teal-100 text-teal-600 font-semibold transition-colors"
            style={{
              gap: "0.5rem",
              padding: "0.75rem",
              borderRadius: "0.5rem",
            }}
          >
            <CheckCheck style={{ width: "1.125rem", height: "1.125rem" }} />
            Mark all as read
          </button>
        </div>
      )}

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <Spinner size="md" />
          </div>
        ) : notifications.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center text-gray-500"
            style={{ padding: "3rem" }}
          >
            <Inbox
              className="text-gray-400"
              style={{ width: "4rem", height: "4rem", marginBottom: "1rem" }}
            />
            <p className="text-lg">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100" style={{ width: "100%" }}>
            {notifications.slice(0, 10).map((notification) => (
              <div
                key={notification._id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNotificationClick(notification);
                }}
                className={`hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition ${!notification.isRead ? "bg-teal-50" : ""
                  }`}
                style={{ padding: "1.25rem" }}
                role="button"
                tabIndex={0}
              >
                <div className="flex" style={{ gap: "1rem" }}>
                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <div
                      className="bg-teal-600 flex-shrink-0"
                      style={{
                        width: "0.625rem",
                        height: "0.625rem",
                        borderRadius: "50%",
                        marginTop: "0.5rem",
                      }}
                    ></div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      className={`${!notification.isRead
                        ? "font-semibold text-gray-900"
                        : "text-gray-700"
                        }`}
                      style={{ fontSize: "0.9375rem", lineHeight: "1.5" }}
                    >
                      {notification.message}
                    </p>
                    <p
                      className="text-gray-500"
                      style={{ fontSize: "0.8125rem", marginTop: "0.375rem" }}
                    >
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: Dropdown */}
      <div
        //ref={dropdownRef}
        ref={desktopDropdownRef}
        className="hidden md:block absolute bg-white shadow-2xl border border-gray-200 overflow-y-auto slide-down"
        style={{
          right: 0,
          marginTop: "0.75rem",
          width: "24rem",
          maxWidth: "calc(100vw - 1rem)",
          borderRadius: "0.75rem",
          maxHeight: "min(32rem, calc(100vh - 6rem))",
          zIndex: 50,
        }}
        role="region"
        aria-label="Notifications"
      >
        {/* Header */}
        <div
          className="border-b border-gray-100 flex items-center justify-between sticky bg-white/95 backdrop-blur-sm"
          style={{
            padding: "1rem",
            top: 0,
            zIndex: 10,
            borderTopLeftRadius: "0.75rem",
            borderTopRightRadius: "0.75rem",
          }}
        >
          <h3
            className="font-bold text-gray-900"
            style={{ fontSize: "1.125rem" }}
          >
            Notifications
          </h3>
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-teal-600 hover:text-teal-700 flex items-center"
              style={{ fontSize: "0.875rem", gap: "0.25rem" }}
            >
              <CheckCheck style={{ width: "1rem", height: "1rem" }} />
              Mark all as read
            </button>
          )}
        </div>

        {/* Content */}
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div style={{ padding: "2rem" }}>
              <Spinner size="md" />
            </div>
          ) : notifications.length === 0 ? (
            <div
              className="text-center text-gray-500"
              style={{ padding: "2rem" }}
            >
              <Inbox
                className="text-gray-400 mx-auto"
                style={{
                  width: "3rem",
                  height: "3rem",
                  marginBottom: "0.5rem",
                }}
              />
              <p>No notifications</p>
            </div>
          ) : (
            notifications.slice(0, 10).map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`hover:bg-gray-50 cursor-pointer transition ${!notification.isRead ? "bg-teal-50" : ""
                  }`}
                style={{ padding: "1rem" }}
              >
                <div className="flex" style={{ gap: "0.75rem" }}>
                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <div
                      className="bg-teal-600 flex-shrink-0"
                      style={{
                        width: "0.5rem",
                        height: "0.5rem",
                        borderRadius: "50%",
                        marginTop: "0.5rem",
                      }}
                    ></div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      className={`${!notification.isRead
                        ? "font-semibold text-gray-900"
                        : "text-gray-700"
                        }`}
                      style={{ fontSize: "0.875rem" }}
                    >
                      {notification.message}
                    </p>
                    <p
                      className="text-gray-500"
                      style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}
                    >
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 10 && (
          <div
            className="border-t border-gray-200 text-center"
            style={{ padding: "0.5rem" }}
          >
            <button
              className="text-teal-600 hover:text-teal-700"
              style={{ fontSize: "0.875rem" }}
            >
              View all notifications
            </button>
          </div>
        )}
      </div>

      {/* Mobile: Full-screen Menu - Render via portal to break out of positioning context */}
      {typeof window !== "undefined" &&
        createPortal(renderMobileMenu(), document.body)}
    </>
  );
};

export default NotificationList;
