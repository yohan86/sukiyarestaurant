"use client";

import { useState, useEffect } from "react";
import { updateMenuItem, type MenuItem } from "@/lib/admin-api";

interface EditFoodModalProps {
  isOpen: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditFoodModal({
  isOpen,
  item,
  onClose,
  onSuccess,
}: EditFoodModalProps) {
  const [formData, setFormData] = useState({
    nameEn: "",
    nameJp: "",
    price: "",
    imageUrl: "",
    category: "Main Course",
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    "Main Course",
    "Appetizer",
    "Dessert",
    "Drink",
    "Side Dish",
  ];

  useEffect(() => {
    if (item) {
      setFormData({
        nameEn: item.nameEn,
        nameJp: item.nameJp,
        price: item.price.toString(),
        imageUrl: item.imageUrl,
        category: item.category,
        isActive: item.isActive,
      });
      setError(null);
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setError(null);
    setIsSubmitting(true);

    try {
      // Validate form
      if (!formData.nameEn.trim() || !formData.nameJp.trim()) {
        setError("Name (EN) and Name (JP) are required");
        setIsSubmitting(false);
        return;
      }

      if (!formData.price || parseFloat(formData.price) <= 0) {
        setError("Price must be greater than 0");
        setIsSubmitting(false);
        return;
      }

      if (!formData.imageUrl.trim()) {
        setError("Image URL is required");
        setIsSubmitting(false);
        return;
      }

      // Update menu item
      await updateMenuItem(item._id, {
        nameEn: formData.nameEn.trim(),
        nameJp: formData.nameJp.trim(),
        price: parseFloat(formData.price),
        imageUrl: formData.imageUrl.trim(),
        category: formData.category,
        isActive: formData.isActive,
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to update menu item:", err);
      setError("Failed to update menu item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/70 backdrop-blur-md touch-manipulation"
      onClick={handleClose}
    >
      <div
        className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-white/50 backdrop-blur-sm touch-manipulation"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#31a354] via-[#31a354] to-[#31a354] px-6 md:px-8 py-6 md:py-7 flex items-center justify-between rounded-t-3xl shadow-lg z-10 min-h-[80px]">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
              Edit Food Item
            </h2>
            <p className="text-base md:text-lg text-white/95 mt-2 font-medium">
              Update menu item details
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-white/90 active:text-white transition-all duration-200 p-3 md:p-4 active:bg-white/30 rounded-full backdrop-blur-sm min-w-[48px] min-h-[48px] md:min-w-[56px] md:min-h-[56px] flex items-center justify-center touch-manipulation disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg
              className="w-7 h-7 md:w-8 md:h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl font-bold">
                {error}
              </div>
            )}

            {/* Name (EN) */}
            <div>
              <label className="block text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">
                Name (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) =>
                  setFormData({ ...formData, nameEn: e.target.value })
                }
                required
                className="w-full rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 md:py-3.5 text-base font-medium text-gray-900 shadow-sm focus:border-[#31a354] focus:ring-2 focus:ring-[#31a354]/20 focus:outline-none transition-all duration-200 min-h-[48px] touch-manipulation hover:border-gray-300"
                placeholder="e.g., Sukiyaki Set"
              />
            </div>

            {/* Name (JP) */}
            <div>
              <label className="block text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">
                Name (Japanese) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nameJp}
                onChange={(e) =>
                  setFormData({ ...formData, nameJp: e.target.value })
                }
                required
                className="w-full rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 md:py-3.5 text-base font-medium text-gray-900 shadow-sm focus:border-[#31a354] focus:ring-2 focus:ring-[#31a354]/20 focus:outline-none transition-all duration-200 min-h-[48px] touch-manipulation hover:border-gray-300"
                placeholder="e.g., すき焼きセット"
              />
            </div>

            {/* Price and Category Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
              {/* Price */}
              <div>
                <label className="block text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">
                  Price (¥) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                  min="0"
                  step="1"
                  className="w-full rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 md:py-3.5 text-base font-medium text-gray-900 shadow-sm focus:border-[#31a354] focus:ring-2 focus:ring-[#31a354]/20 focus:outline-none transition-all duration-200 min-h-[48px] touch-manipulation hover:border-gray-300"
                  placeholder="1500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                  className="w-full rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 md:py-3.5 text-base font-medium text-gray-900 shadow-sm focus:border-[#31a354] focus:ring-2 focus:ring-[#31a354]/20 focus:outline-none transition-all duration-200 min-h-[48px] touch-manipulation hover:border-gray-300"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">
                Image URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                required
                className="w-full rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 md:py-3.5 text-base font-medium text-gray-900 shadow-sm focus:border-[#31a354] focus:ring-2 focus:ring-[#31a354]/20 focus:outline-none transition-all duration-200 min-h-[48px] touch-manipulation hover:border-gray-300"
                placeholder="https://via.placeholder.com/150"
              />
            </div>

            {/* Image Preview */}
            {formData.imageUrl && (
              <div>
                <label className="block text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">
                  Preview
                </label>
                <div className="w-32 h-32 relative rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/150";
                    }}
                  />
                </div>
              </div>
            )}

            {/* Status Toggle */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-6 h-6 rounded border-2 border-gray-300 text-[#31a354] focus:ring-2 focus:ring-[#31a354]/20 focus:ring-offset-0 cursor-pointer touch-manipulation"
                />
                <span className="text-base font-bold text-gray-900">
                  Active (visible in menu)
                </span>
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-4 border-t-2 border-white/50">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all duration-200 active:scale-95 touch-manipulation min-h-[48px] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-[#31a354] to-[#31a354] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 touch-manipulation min-h-[48px] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    <span>Update Food Item</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

