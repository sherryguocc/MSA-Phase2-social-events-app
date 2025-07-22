import React, { useState, useEffect } from "react";

interface EventFormData {
  title: string;
  description: string;
  location: string;
  eventTime: string;
  minAttendees: string;
  maxAttendees: string;
  imageUrl: string;
}

interface EventFormProps {
  initialData?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => Promise<void>;
  isLoading: boolean;
  submitButtonText: string;
  title: string;
  onCancel?: () => void;
}

const EventForm: React.FC<EventFormProps> = ({
  initialData = {},
  onSubmit,
  isLoading,
  submitButtonText,
  title,
  onCancel
}) => {
  // Helper function to get default date-time (tomorrow at 10:00 AM)
  const getDefaultDateTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0); // Set to 10:00 AM
    return tomorrow.toISOString().slice(0, 16); // Format for datetime-local
  };

  const [formData, setFormData] = useState<EventFormData>({
    title: initialData.title || "",
    description: initialData.description || "",
    location: initialData.location || "",
    eventTime: initialData.eventTime || getDefaultDateTime(),
    minAttendees: initialData.minAttendees || "1",
    maxAttendees: initialData.maxAttendees || "10",
    imageUrl: initialData.imageUrl || "",
  });

  const [error, setError] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Update form data when initialData changes (useful for edit mode) - only once
  useEffect(() => {
    if (initialData && !isInitialized) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        location: initialData.location || "",
        eventTime: initialData.eventTime || getDefaultDateTime(),
        minAttendees: initialData.minAttendees || "1",
        maxAttendees: initialData.maxAttendees || "10",
        imageUrl: initialData.imageUrl || "",
      });
      setIsInitialized(true);
    }
  }, [initialData, isInitialized]);

  const handleInputChange = (field: keyof EventFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (!formData.title.trim()) {
      setError("Event title is required");
      return;
    }
    
    if (!formData.description.trim()) {
      setError("Event description is required");
      return;
    }
    
    if (!formData.location.trim()) {
      setError("Event location is required");
      return;
    }
    
    if (!formData.eventTime) {
      setError("Event time is required");
      return;
    }
    
    if (new Date(formData.eventTime) <= new Date()) {
      setError("Event time must be in the future");
      return;
    }
    
    const minAttendeesNum = parseInt(formData.minAttendees, 10);
    const maxAttendeesNum = parseInt(formData.maxAttendees, 10);
    
    if (isNaN(minAttendeesNum) || minAttendeesNum < 1) {
      setError("Minimum attendees must be at least 1");
      return;
    }
    
    if (isNaN(maxAttendeesNum) || maxAttendeesNum < minAttendeesNum) {
      setError("Maximum attendees must be greater than or equal to minimum attendees");
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || "Failed to save event");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-2 sm:px-4">
      <div className="max-w-3xl w-full mx-auto mt-4 sm:mt-10 p-4 sm:p-6 lg:p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-blue-100">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4 sm:mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-400 drop-shadow-lg">
          {title}
        </h2>
        <div className="ml-2 sm:ml-3">
          <p className="text-xs sm:text-sm text-amber-800">
            <strong className="font-semibold">📝 Event Deletion Policy:</strong> To prevent misuse of website resources and encourage thoughtful event creation, users cannot delete events. If you really need to delete an event, please contact the administrator at{' '}
            <a 
              href="mailto:sherryguocc@gmail.com" 
              className="font-medium text-amber-900 underline hover:text-amber-700 transition-colors"
            >
              sherryguocc@gmail.com
            </a>
            .
          </p>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Event Title */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a2 2 0 012-2z" />
              </svg>
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              disabled={isLoading}
              maxLength={100}
              className="input input-bordered w-full text-sm sm:text-base bg-white/90 focus:bg-white border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              placeholder="Give your event a catchy title..."
              required
            />
            <p className={`text-xs mt-1 ${formData.title.length > 80 ? 'text-orange-500' : formData.title.length > 95 ? 'text-red-500' : 'text-gray-500'}`}>
              Choose a clear, descriptive title that tells people what your event is about. ({formData.title.length}/100 characters)
            </p>
          </div>

          {/* Event Description */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Event Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={isLoading}
              rows={4}
              maxLength={500}
              className="textarea textarea-bordered w-full text-sm sm:text-base bg-white/90 focus:bg-white border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
              placeholder="Describe your event in detail..."
              required
            />
            <p className={`text-xs mt-1 ${formData.description.length > 400 ? 'text-orange-500' : formData.description.length > 475 ? 'text-red-500' : 'text-gray-500'}`}>
              Provide details about what attendees can expect, activities planned, etc. ({formData.description.length}/500 characters)
            </p>
          </div>

          {/* Event Location */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Event Location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              disabled={isLoading}
              maxLength={150}
              className="input input-bordered w-full text-sm sm:text-base bg-white/90 focus:bg-white border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              placeholder="Where will your event take place?"
              required
            />
            <p className={`text-xs mt-1 ${formData.location.length > 120 ? 'text-orange-500' : formData.location.length > 140 ? 'text-red-500' : 'text-gray-500'}`}>
              Specify the venue, address, or online meeting link for your event. ({formData.location.length}/150 characters)
            </p>
          </div>

          {/* Event Time */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Event Date & Time *
            </label>
            <input
              type="datetime-local"
              value={formData.eventTime}
              onChange={(e) => handleInputChange('eventTime', e.target.value)}
              disabled={isLoading}
              step="60"
              className="input input-bordered w-full text-sm sm:text-base bg-white/90 focus:bg-white border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Select when your event will start. Default is set to tomorrow 10:00 AM. 
              <br />
              💡 Tip: Click on the time part to change AM/PM if needed.
            </p>
          </div>

          {/* Attendees Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Min Attendees *
              </label>
              <input
                type="number"
                value={formData.minAttendees}
                onChange={(e) => handleInputChange('minAttendees', e.target.value)}
                disabled={isLoading}
                min="1"
                className="input input-bordered w-full text-sm sm:text-base bg-white/90 focus:bg-white border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Minimum people needed for the event to happen.</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Max Attendees *
              </label>
              <input
                type="number"
                value={formData.maxAttendees}
                onChange={(e) => handleInputChange('maxAttendees', e.target.value)}
                disabled={isLoading}
                min="1"
                className="input input-bordered w-full text-sm sm:text-base bg-white/90 focus:bg-white border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Maximum people that can attend this event.</p>
            </div>
          </div>

          {/* Event Image URL */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Event Image URL
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => handleInputChange('imageUrl', e.target.value)}
              disabled={isLoading}
              className="input input-bordered w-full text-sm sm:text-base bg-white/90 focus:bg-white border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              placeholder="https://example.com/event-image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">Optional: Add an image URL to make your event more appealing.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 text-sm sm:text-base font-semibold !text-white !bg-gradient-to-r !from-blue-500 !to-purple-600 hover:!from-blue-600 hover:!to-purple-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 !border-0"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                submitButtonText
              )}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 py-3 px-4 text-sm sm:text-base font-semibold !text-gray-700 !bg-white !border-2 !border-gray-300 hover:!border-gray-400 hover:!bg-gray-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
