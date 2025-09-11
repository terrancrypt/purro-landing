import React from "react";
import type { Template } from "../types/template";

interface TemplateManagerProps {
  templates: Template[];
  selectedTemplateId: string;
  onTemplateSelect: (templateId: string) => void;
  className?: string;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({
  templates,
  selectedTemplateId,
  onTemplateSelect,
  className = "",
}) => {
  return (
    <div className={`template-manager ${className}`}>
      <div className="mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-white">
          Choose Template
        </h3>
        <p className="text-gray-400 text-xs sm:text-sm">
          Select a template style for your share card
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`template-option cursor-pointer rounded-lg border-2 transition-all duration-200 overflow-hidden touch-manipulation ${
              selectedTemplateId === template.id
                ? "border-blue-500 ring-2 ring-blue-500/20"
                : "border-gray-600/30 hover:border-gray-500/50"
            }`}
            onClick={() => onTemplateSelect(template.id)}
          >
            {/* Template Preview */}
            <div className="aspect-video relative bg-gray-800/50">
              <img
                src={template.img}
                alt={template.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Overlay with template info */}
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-sm font-medium">{template.name}</div>
                  <div className="text-xs text-gray-300 mt-1">
                    {template.mode} mode
                  </div>
                </div>
              </div>

              {/* Selected indicator */}
              {selectedTemplateId === template.id && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Template info */}
            <div className="p-2 sm:p-3">
              <div className="font-medium text-white text-xs sm:text-sm mb-1">
                {template.name}
              </div>
              <div className="text-gray-400 text-xs line-clamp-2 hidden sm:block">
                {template.description}
              </div>

              {/* Color palette preview */}
              <div className="flex items-center gap-1 mt-1 sm:mt-2">
                <div
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-gray-600"
                  style={{ backgroundColor: template.colors.primary }}
                  title="Primary color"
                />
                <div
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-gray-600"
                  style={{ backgroundColor: template.colors.secondary }}
                  title="Secondary color"
                />
                <div
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-gray-600"
                  title="Background color"
                />
                {template.colors.accent && (
                  <div
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-gray-600"
                    style={{ backgroundColor: template.colors.accent }}
                    title="Accent color"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateManager;
