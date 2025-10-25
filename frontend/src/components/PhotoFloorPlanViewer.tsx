/**
 * Component 4: Photo and Floor Plan Viewer
 * Modal overlay for full-size images with thumbnail navigation
 * States: Loading, empty (no photos), displayed, error
 */

import React, { useState } from 'react';
import { Button } from './common';
import type { Unit } from '@feature-analyst/shared';

export interface PhotoFloorPlanViewerProps {
  unit: Unit | null;
  onClose: () => void;
}

export const PhotoFloorPlanViewer: React.FC<PhotoFloorPlanViewerProps> = ({ unit, onClose }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageLoadError, setImageLoadError] = useState(false);

  if (!unit) return null;

  const allImages = [
    ...(unit.photoUrls || []),
    ...(unit.floorPlanUrls || []),
  ];

  const hasImages = allImages.length > 0;
  const currentImage = allImages[selectedImageIndex];

  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    padding: '20px',
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    color: '#FFFFFF',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: '600',
  };

  const closeButtonStyles: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: '#FFFFFF',
    fontSize: '32px',
    cursor: 'pointer',
    padding: '10px',
  };

  const contentStyles: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  };

  const imageContainerStyles: React.CSSProperties = {
    maxWidth: '90%',
    maxHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const imageStyles: React.CSSProperties = {
    maxWidth: '100%',
    maxHeight: '80vh',
    objectFit: 'contain',
    borderRadius: '8px',
  };

  const navigationButtonStyles: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: '#FFFFFF',
    fontSize: '32px',
    padding: '20px',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'background-color 0.2s ease',
  };

  const thumbnailContainerStyles: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    overflowX: 'auto',
    padding: '20px 0',
    maxWidth: '100%',
  };

  const thumbnailStyles: React.CSSProperties = {
    width: '80px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '4px',
    cursor: 'pointer',
    opacity: 0.6,
    transition: 'opacity 0.2s ease',
    border: '2px solid transparent',
  };

  const selectedThumbnailStyles: React.CSSProperties = {
    ...thumbnailStyles,
    opacity: 1,
    border: '2px solid #04D2C6',
  };

  const emptyStateStyles: React.CSSProperties = {
    textAlign: 'center',
    color: '#FFFFFF',
    padding: '60px 20px',
  };

  const errorStyles: React.CSSProperties = {
    textAlign: 'center',
    color: '#FFFFFF',
    padding: '60px 20px',
  };

  const unitInfoStyles: React.CSSProperties = {
    color: '#FFFFFF',
    fontSize: '14px',
    marginBottom: '20px',
  };

  const handlePrevious = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
    setImageLoadError(false);
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
    setImageLoadError(false);
  };

  return (
    <div style={overlayStyles} onClick={onClose}>
      <div style={headerStyles} onClick={(e) => e.stopPropagation()}>
        <div>
          <div style={titleStyles}>
            {unit.communityName} - {unit.unitNumber || 'Unit'}
          </div>
          <div style={unitInfoStyles}>
            {unit.bedrooms} bed • {unit.bathrooms} bath • {unit.squareFeet} sq ft
          </div>
        </div>
        <button style={closeButtonStyles} onClick={onClose}>
          ×
        </button>
      </div>

      <div style={contentStyles} onClick={(e) => e.stopPropagation()}>
        {!hasImages ? (
          <div style={emptyStateStyles}>
            <h3 style={{ marginBottom: '10px' }}>No Photos Available</h3>
            <p>This unit does not have any photos or floor plans.</p>
          </div>
        ) : imageLoadError ? (
          <div style={errorStyles}>
            <h3 style={{ marginBottom: '10px' }}>Photo Unavailable</h3>
            <p>Failed to load this image.</p>
            <Button onClick={() => setImageLoadError(false)} style={{ marginTop: '20px' }}>
              Retry
            </Button>
          </div>
        ) : (
          <>
            {allImages.length > 1 && (
              <button
                style={{ ...navigationButtonStyles, left: '20px' }}
                onClick={handlePrevious}
              >
                ‹
              </button>
            )}
            <div style={imageContainerStyles}>
              <img
                src={currentImage}
                alt={`${unit.unitNumber} - ${selectedImageIndex + 1}`}
                style={imageStyles}
                onError={() => setImageLoadError(true)}
              />
            </div>
            {allImages.length > 1 && (
              <button
                style={{ ...navigationButtonStyles, right: '20px' }}
                onClick={handleNext}
              >
                ›
              </button>
            )}
          </>
        )}
      </div>

      {hasImages && allImages.length > 1 && (
        <div style={thumbnailContainerStyles} onClick={(e) => e.stopPropagation()}>
          {allImages.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              style={idx === selectedImageIndex ? selectedThumbnailStyles : thumbnailStyles}
              onClick={() => {
                setSelectedImageIndex(idx);
                setImageLoadError(false);
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ))}
        </div>
      )}

      {unit.virtualTourUrl && (
        <div style={{ textAlign: 'center', marginTop: '20px' }} onClick={(e) => e.stopPropagation()}>
          <Button
            onClick={() => window.open(unit.virtualTourUrl, '_blank')}
            style={{ backgroundColor: '#04D2C6' }}
          >
            Open Virtual Tour
          </Button>
        </div>
      )}
    </div>
  );
};
