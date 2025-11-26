'use client';

import { useState, useRef, useEffect } from 'react';

interface DraggableElementProps {
  id: string;
  children: React.ReactNode;
  initialX: number;
  initialY: number;
  initialWidth?: number;
  initialHeight?: number;
  bounds: { left: number; top: number; right: number; bottom: number };
  onUpdate?: (id: string, x: number, y: number, width: number, height: number) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export default function DraggableElement({
  id,
  children,
  initialX,
  initialY,
  initialWidth = 100,
  initialHeight = 100,
  bounds,
  onUpdate,
  isSelected = false,
  onSelect,
}: DraggableElementProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeCorner, setResizeCorner] = useState<'tl' | 'tr' | 'bl' | 'br' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialResize, setInitialResize] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    onSelect?.(id);
  };

  const handleResizeMouseDown = (e: React.MouseEvent, corner: 'tl' | 'tr' | 'bl' | 'br') => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeCorner(corner);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialResize({ x: position.x, y: position.y, width: size.width, height: size.height });
    onSelect?.(id);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        let newX = e.clientX - dragStart.x;
        let newY = e.clientY - dragStart.y;

        // Constrain to bounds
        newX = Math.max(bounds.left, Math.min(newX, bounds.right - size.width));
        newY = Math.max(bounds.top, Math.min(newY, bounds.bottom - size.height));

        setPosition({ x: newX, y: newY });
        onUpdate?.(id, newX, newY, size.width, size.height);
      } else if (isResizing && resizeCorner) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        // Use the aspect ratio from when resize started (initialResize)
        const aspectRatio = initialResize.width / initialResize.height;
        let newWidth = initialResize.width;
        let newHeight = initialResize.height;
        let newX = initialResize.x;
        let newY = initialResize.y;

        // Calculate based on which corner is being dragged
        if (resizeCorner === 'br') {
          // Bottom-right: grow from top-left
          newWidth = initialResize.width + deltaX;
          newHeight = newWidth / aspectRatio;
        } else if (resizeCorner === 'bl') {
          // Bottom-left: grow from top-right
          newWidth = initialResize.width - deltaX;
          newHeight = newWidth / aspectRatio;
          newX = initialResize.x + initialResize.width - newWidth;
        } else if (resizeCorner === 'tr') {
          // Top-right: grow from bottom-left
          newWidth = initialResize.width + deltaX;
          newHeight = newWidth / aspectRatio;
          newY = initialResize.y + initialResize.height - newHeight;
        } else if (resizeCorner === 'tl') {
          // Top-left: grow from bottom-right
          newWidth = initialResize.width - deltaX;
          newHeight = newWidth / aspectRatio;
          newX = initialResize.x + initialResize.width - newWidth;
          newY = initialResize.y + initialResize.height - newHeight;
        }

        // Constrain minimum size
        newWidth = Math.max(50, newWidth);
        newHeight = Math.max(50, newHeight);

        // Constrain to bounds
        newX = Math.max(bounds.left, Math.min(newX, bounds.right - newWidth));
        newY = Math.max(bounds.top, Math.min(newY, bounds.bottom - newHeight));

        setPosition({ x: newX, y: newY });
        setSize({ width: newWidth, height: newHeight });
        onUpdate?.(id, newX, newY, newWidth, newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeCorner(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, resizeCorner, dragStart, position, size, initialResize, bounds, id, onUpdate, initialWidth, initialHeight]);

  return (
    <div
      ref={elementRef}
      className={`cursor-move ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: isSelected ? 1000 : 1,
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
      {isSelected && (
        <>
          {/* Corner resize handles */}
          <div
            className="resize-handle absolute top-0 left-0 w-3 h-3 bg-blue-500 border border-white cursor-nwse-resize -translate-x-1/2 -translate-y-1/2"
            onMouseDown={(e) => handleResizeMouseDown(e, 'tl')}
          />
          <div
            className="resize-handle absolute top-0 right-0 w-3 h-3 bg-blue-500 border border-white cursor-nesw-resize translate-x-1/2 -translate-y-1/2"
            onMouseDown={(e) => handleResizeMouseDown(e, 'tr')}
          />
          <div
            className="resize-handle absolute bottom-0 left-0 w-3 h-3 bg-blue-500 border border-white cursor-nesw-resize -translate-x-1/2 translate-y-1/2"
            onMouseDown={(e) => handleResizeMouseDown(e, 'bl')}
          />
          <div
            className="resize-handle absolute bottom-0 right-0 w-3 h-3 bg-blue-500 border border-white cursor-nwse-resize translate-x-1/2 translate-y-1/2"
            onMouseDown={(e) => handleResizeMouseDown(e, 'br')}
          />
        </>
      )}
    </div>
  );
}
