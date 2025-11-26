'use client';

import { useState, useRef, useEffect } from 'react';
import DraggableElement from './DraggableElement';
import dynamic from 'next/dynamic';

const TiptapEditor = dynamic(() => import('./TiptapEditor'), { ssr: false });

interface Element {
  id: string;
  type: 'person' | 'text' | 'logo';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  fontSize?: number;
  htmlContent?: string;
}

const PERSON_IMAGES = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucy',
];

const LOGO_IMAGES = [
  'https://api.dicebear.com/7.x/shapes/svg?seed=Logo1',
  'https://api.dicebear.com/7.x/shapes/svg?seed=Logo2',
  'https://api.dicebear.com/7.x/shapes/svg?seed=Logo3',
  'https://api.dicebear.com/7.x/shapes/svg?seed=Logo4',
];

export default function BillboardEditor() {
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [billboardBounds, setBillboardBounds] = useState({ left: 0, top: 0, right: 0, bottom: 0 });
  const [personImages, setPersonImages] = useState<string[]>([]);
  const [logoImages, setLogoImages] = useState<string[]>([]);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const billboardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const billboardImageRef = useRef<HTMLDivElement>(null);

  const loadImages = () => {
    // Load person images
    fetch('/api/people-images')
      .then(res => res.json())
      .then(data => setPersonImages(data.images))
      .catch(() => setPersonImages([]));

    // Load logo images
    fetch('/api/logos')
      .then(res => res.json())
      .then(data => setLogoImages(data.images))
      .catch(() => setLogoImages([]));
  };

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    if (billboardRef.current) {
      const rect = billboardRef.current.getBoundingClientRect();
      setBillboardBounds({
        left: rect.left,
        top: rect.top,
        right: rect.left + rect.width,
        bottom: rect.top + rect.height,
      });
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't delete if user is typing in an input, textarea, or contenteditable element
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if ((e.key === 'Backspace' || e.key === 'Delete') && selectedElement) {
        e.preventDefault();
        setElements(elements.filter(el => el.id !== selectedElement));
        setSelectedElement(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, elements]);

  const addPerson = (imageUrl: string) => {
    // Load image to get natural aspect ratio
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      const targetHeight = 150;
      const targetWidth = targetHeight * aspectRatio;

      const newElement: Element = {
        id: `person-${Date.now()}`,
        type: 'person',
        x: billboardBounds.left + 50,
        y: billboardBounds.top + 50,
        width: targetWidth,
        height: targetHeight,
        content: imageUrl,
      };
      setElements([...elements, newElement]);
      setSelectedElement(newElement.id);
    };
    img.src = imageUrl;
  };

  const addText = () => {
    // Offset new text elements slightly to avoid stacking
    const textElements = elements.filter(el => el.type === 'text');
    const offset = textElements.length * 20;

    console.log('Adding text - billboardBounds:', billboardBounds);

    const newElement: Element = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: billboardBounds.left + 50 + offset,
      y: billboardBounds.top + 50 + offset,
      width: 300,
      height: 100,
      content: 'EDIT ME',
      htmlContent: '<p style="text-align: center"><span style="font-family: Oswald; font-size: 24px">EDIT ME</span></p>',
      fontSize: 24,
    };
    console.log('New text element:', newElement);
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const addLogo = (imageUrl: string) => {
    // Load image to get natural aspect ratio
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      const targetHeight = 120;
      const targetWidth = targetHeight * aspectRatio;

      const newElement: Element = {
        id: `logo-${Date.now()}`,
        type: 'logo',
        x: billboardBounds.right - 200,
        y: billboardBounds.top + 50,
        width: targetWidth,
        height: targetHeight,
        content: imageUrl,
      };
      setElements([...elements, newElement]);
      setSelectedElement(newElement.id);
    };
    img.src = imageUrl;
  };

  const updateElement = (id: string, x: number, y: number, width: number, height: number) => {
    // Convert from relative (to billboard) to absolute coordinates
    const absoluteX = x + billboardBounds.left;
    const absoluteY = y + billboardBounds.top;

    setElements(elements.map(el =>
      el.id === id ? { ...el, x: absoluteX, y: absoluteY, width, height } : el
    ));
  };

  const updateTextContent = (id: string, htmlContent: string) => {
    // Extract plain text for compatibility
    const temp = document.createElement('div');
    temp.innerHTML = htmlContent;
    const plainText = temp.textContent || temp.innerText || '';

    setElements(elements.map(el =>
      el.id === id ? { ...el, content: plainText.toUpperCase(), htmlContent } : el
    ));
  };

  const updateTextFontSize = (id: string, fontSize: number) => {
    setElements(elements.map(el =>
      el.id === id ? { ...el, fontSize } : el
    ));
  };

  const deleteElement = () => {
    if (selectedElement) {
      setElements(elements.filter(el => el.id !== selectedElement));
      setSelectedElement(null);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'people' | 'logos') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Reload images after successful upload
        loadImages();
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }

    // Reset input
    e.target.value = '';
  };

  const handleDeleteImage = async (imagePath: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Delete this image?')) return;

    try {
      const response = await fetch(`/api/delete-image?path=${encodeURIComponent(imagePath)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Reload images after successful delete
        loadImages();
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const saveImage = async () => {
    if (!billboardImageRef.current || !billboardRef.current) return;

    try {
      // Ensure fonts are loaded
      await document.fonts.ready;

      // Explicitly check if fonts are loaded
      const oswald = document.fonts.check('500 24px Oswald');
      const playfair = document.fonts.check('24px "Playfair Display"');
      console.log('Fonts loaded - Oswald:', oswald, 'Playfair Display:', playfair);

      // Get fresh bounds at save time
      const billboardRect = billboardRef.current.getBoundingClientRect();
      const currentBounds = {
        left: billboardRect.left,
        top: billboardRect.top,
        right: billboardRect.right,
        bottom: billboardRect.bottom,
      };

      console.log('Current billboard bounds:', currentBounds);
      console.log('Billboard rect:', billboardRect);

      // Load background image fresh
      const bgImg = new Image();
      await new Promise<void>((resolve, reject) => {
        bgImg.onload = () => resolve();
        bgImg.onerror = () => reject(new Error('Failed to load background'));
        bgImg.src = '/billboard.png';
      });

      console.log('Background loaded:', bgImg.naturalWidth, 'x', bgImg.naturalHeight);

      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = bgImg.naturalWidth * scale;
      canvas.height = bgImg.naturalHeight * scale;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw background
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      console.log('Background drawn to canvas');

      // Editable area coordinates on canvas
      const editableArea = {
        x: canvas.width * 0.185,
        y: canvas.height * 0.205,
        width: canvas.width * 0.63,
        height: canvas.height * 0.4275,
      };

      // Calculate scale factor: how much bigger is the canvas editable area vs the rendered billboard?
      const scaleRatio = editableArea.width / billboardRect.width;

      console.log('Billboard rendered size:', billboardRect.width, 'x', billboardRect.height);
      console.log('Canvas editable area:', editableArea.width, 'x', editableArea.height);
      console.log('Scale ratio:', scaleRatio);
      console.log('Processing', elements.length, 'elements');

      // Apply clipping path to match the billboard shape
      // Path from SVG: M 0.0389 0.9944 C 0.0731 0.5730 0.0262 0.1798 0.0009 0.0014 L 0.9986 0.0014 C 0.9682 0.1469 0.9173 0.5498 0.9563 0.9972 L 0.0389 0.9944 Z
      ctx.save();
      ctx.beginPath();
      // Convert normalized coordinates (0-1) to canvas coordinates for the editable area
      const w = editableArea.width;
      const h = editableArea.height;
      const x = editableArea.x;
      const y = editableArea.y;

      ctx.moveTo(x + 0.0389 * w, y + 0.9944 * h);
      ctx.bezierCurveTo(x + 0.0731 * w, y + 0.5730 * h, x + 0.0262 * w, y + 0.1798 * h, x + 0.0009 * w, y + 0.0014 * h);
      ctx.lineTo(x + 0.9986 * w, y + 0.0014 * h);
      ctx.bezierCurveTo(x + 0.9682 * w, y + 0.1469 * h, x + 0.9173 * w, y + 0.5498 * h, x + 0.9563 * w, y + 0.9972 * h);
      ctx.lineTo(x + 0.0389 * w, y + 0.9944 * h);
      ctx.closePath();
      ctx.clip();

      // Draw each element
      for (const element of elements) {
        // Elements store absolute coordinates, convert to relative (to billboard)
        const relativeX = element.x - currentBounds.left;
        const relativeY = element.y - currentBounds.top;

        // Scale everything by the same ratio to maintain proportions
        const x = editableArea.x + (relativeX * scaleRatio);
        const y = editableArea.y + (relativeY * scaleRatio);
        const w = element.width * scaleRatio;
        const h = element.height * scaleRatio;

        console.log(`Element ${element.id}:`, element.type);
        console.log(`  Source absolute: x=${element.x}, y=${element.y}`);
        console.log(`  Source relative: x=${relativeX}, y=${relativeY}, w=${element.width}, h=${element.height}`);
        console.log(`  Source aspect ratio: ${element.width / element.height}`);
        console.log(`  Canvas: x=${x}, y=${y}, w=${w}, h=${h}`);
        console.log(`  Canvas aspect ratio: ${w / h}`);

        if (element.type === 'text') {
          const html = element.htmlContent || element.content;
          console.log('Drawing text element, HTML:', html);

          // Extract font family, size, alignment, bold, italic from HTML
          let fontFamily = 'Arial';
          let fontSize = element.fontSize || 24;
          let textAlign = 'center';
          let isBold = false;
          let isItalic = false;

          const fontFamilyMatch = html.match(/font-family:\s*([^;}"']+)/);
          if (fontFamilyMatch) {
            fontFamily = fontFamilyMatch[1].split(',')[0].trim().replace(/['"]/g, '');
            console.log('Extracted font family from HTML:', fontFamily);
          }

          // Map font names to loaded fonts
          if (fontFamily.toLowerCase().includes('playfair')) {
            fontFamily = 'Playfair Display';
            console.log('Mapped to Playfair Display');
          } else if (fontFamily.toLowerCase().includes('oswald')) {
            fontFamily = 'Oswald';
            console.log('Mapped to Oswald');
          }

          console.log('Final font family:', fontFamily);

          const fontSizeMatch = html.match(/font-size:\s*(\d+)px/);
          if (fontSizeMatch) {
            fontSize = parseInt(fontSizeMatch[1]);
          }

          const alignMatch = html.match(/text-align:\s*(\w+)/);
          if (alignMatch) {
            textAlign = alignMatch[1];
          }

          if (html.includes('<strong>') || html.includes('font-weight: bold') || html.includes('font-weight:bold')) {
            isBold = true;
          }

          if (html.includes('<em>') || html.includes('font-style: italic') || html.includes('font-style:italic')) {
            isItalic = true;
          }

          // Extract text and preserve line breaks
          const temp = document.createElement('div');
          temp.innerHTML = html;

          // Get text with line breaks preserved
          let lines: string[] = [];
          const paragraphs = temp.querySelectorAll('p');
          if (paragraphs.length > 0) {
            paragraphs.forEach((p) => {
              const text = (p.textContent || '').trim().toUpperCase();
              if (text) lines.push(text);
            });
          } else {
            // Fallback: split by <br> or newlines
            const text = (temp.textContent || temp.innerText || element.content).toUpperCase();
            lines = text.split('\n').map(l => l.trim()).filter(l => l);
          }

          if (lines.length === 0) {
            lines = [element.content.toUpperCase()];
          }

          console.log('Extracted lines:', lines);
          console.log('Font:', fontFamily, fontSize, 'Align:', textAlign, 'Bold:', isBold, 'Italic:', isItalic);

          // Draw text with proper alignment and line breaks
          const scaledFontSize = fontSize * scaleRatio;

          // For Oswald, use weight 500 (medium) instead of bold/normal
          let fontWeight = 'normal';
          if (fontFamily === 'Oswald') {
            fontWeight = '500';
          } else if (isBold) {
            fontWeight = 'bold';
          }

          const fontStyle = isItalic ? 'italic' : 'normal';
          const lineHeight = scaledFontSize * 1.2;

          ctx.save();
          ctx.fillStyle = '#D8D8C7';
          // Quote font names with spaces
          const quotedFontFamily = fontFamily.includes(' ') ? `"${fontFamily}"` : fontFamily;
          ctx.font = `${fontStyle} ${fontWeight} ${scaledFontSize}px ${quotedFontFamily}, Arial, sans-serif`;
          console.log('Canvas font string:', ctx.font);
          ctx.textBaseline = 'middle';

          // Calculate starting Y position to center all lines vertically
          const totalHeight = lines.length * lineHeight;
          let startY = y + (h - totalHeight) / 2 + lineHeight / 2;

          lines.forEach((line, index) => {
            const lineY = startY + (index * lineHeight);

            if (textAlign === 'left') {
              ctx.textAlign = 'left';
              ctx.fillText(line, x, lineY);
            } else if (textAlign === 'right') {
              ctx.textAlign = 'right';
              ctx.fillText(line, x + w, lineY);
            } else {
              ctx.textAlign = 'center';
              ctx.fillText(line, x + w / 2, lineY);
            }
          });

          ctx.restore();

          console.log('Drew text with', lines.length, 'lines');
        } else {
          // Load image fresh
          const img = new Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => {
              console.error('Failed to load:', element.content);
              resolve(); // Continue even if one image fails
            };
            img.src = element.content;
          });

          if (img.complete && img.naturalWidth > 0) {
            // Calculate the aspect ratio of the element box
            const boxAspect = element.width / element.height;
            const imgAspect = img.naturalWidth / img.naturalHeight;

            console.log(`  Image natural size: ${img.naturalWidth} x ${img.naturalHeight}, aspect: ${imgAspect}`);
            console.log(`  Box aspect: ${boxAspect}`);

            // Draw image to fit within the box while maintaining its aspect ratio (object-fit: contain)
            let drawW = w;
            let drawH = h;
            let drawX = x;
            let drawY = y;

            if (imgAspect > boxAspect) {
              // Image is wider than box - fit to width
              drawH = w / imgAspect;
              drawY = y + (h - drawH) / 2;
            } else {
              // Image is taller than box - fit to height
              drawW = h * imgAspect;
              drawX = x + (w - drawW) / 2;
            }

            ctx.drawImage(img, drawX, drawY, drawW, drawH);
            console.log(`Drew image with contain: x=${drawX}, y=${drawY}, w=${drawW}, h=${drawH}`);
          }
        }
      }

      console.log('All elements drawn, creating blob');

      // Draw gradient overlay on top of everything
      const gradient = ctx.createLinearGradient(editableArea.x, editableArea.y, editableArea.x, editableArea.y + editableArea.height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
      gradient.addColorStop(0.48, 'rgba(102, 102, 102, 0.3)');
      gradient.addColorStop(0.52, 'rgba(102, 102, 102, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');

      ctx.fillStyle = gradient;
      ctx.fillRect(editableArea.x, editableArea.y, editableArea.width, editableArea.height);

      console.log('Drew gradient overlay');

      // Restore context after clipping
      ctx.restore();

      // Download
      canvas.toBlob((blob) => {
        if (!blob) throw new Error('Failed to create blob');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'billboard-hq.png';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        console.log('Download initiated');
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Save failed:', error);
      alert(`Failed to save image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Fixed Sidebar */}
      <div className="w-96 bg-gray-800 fixed left-0 top-0 h-screen flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold mb-6 text-white">Billboard Editor</h1>

          <div className="space-y-6">
          {/* Person Images */}
          <div>
            <h3 className="font-semibold mb-2 text-white">Add Person</h3>
            <div className="grid grid-cols-3 gap-2">
              {personImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => addPerson(img)}
                  className="aspect-square border-2 border-gray-600 rounded hover:border-blue-500 overflow-hidden bg-gray-700"
                >
                  <img src={img} alt={`Person ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
              <label className="aspect-square border-2 border-dashed border-gray-600 rounded hover:border-blue-500 flex items-center justify-center cursor-pointer bg-gray-700">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUpload(e, 'people')}
                />
                <span className="text-2xl text-gray-400">+</span>
              </label>
            </div>
          </div>

          {/* Text */}
          <div>
            <h3 className="font-semibold mb-2 text-white">Add Text</h3>
            <button
              onClick={addText}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
            >
              Add Text
            </button>
            {selectedElement && elements.find(el => el.id === selectedElement)?.type === 'text' && (
              <div>
                <h4 className="text-sm font-semibold mb-2 text-white">Edit Text</h4>
                <TiptapEditor
                  value={elements.find(el => el.id === selectedElement)?.htmlContent || ''}
                  onChange={(html) => updateTextContent(selectedElement, html)}
                />
              </div>
            )}
          </div>

          {/* Logos */}
          <div>
            <h3 className="font-semibold mb-2 text-white">Add Logo</h3>
            <div className="grid grid-cols-3 gap-2">
              {logoImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => addLogo(img)}
                  className="aspect-square border-2 border-gray-600 rounded hover:border-blue-500 overflow-hidden bg-gray-700"
                >
                  <img src={img} alt={`Logo ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
              <label className="aspect-square border-2 border-dashed border-gray-600 rounded hover:border-blue-500 flex items-center justify-center cursor-pointer bg-gray-700">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUpload(e, 'logos')}
                />
                <span className="text-2xl text-gray-400">+</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-6 border-t border-gray-700">
            <button
              onClick={deleteElement}
              disabled={!selectedElement}
              className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-600"
            >
              Delete Selected
            </button>
            <button
              onClick={saveImage}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save Image
            </button>
          </div>
        </div>
      </div>

        {/* Buy Me a Coffee - Fixed at bottom */}
        <div className="border-t border-gray-700">
          <a
            href="https://www.buymeacoffee.com/sjw87"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center px-4 py-3 font-medium text-sm hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: '#FFDD00',
              color: '#000000'
            }}
          >
            <span className="mr-2">☕</span>
            Buy me a coffee
          </a>
        </div>
      </div>

      {/* Info Button - Bottom Right */}
      <button
        onClick={() => setShowInfoModal(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg flex items-center justify-center text-xl font-bold z-50"
        title="Information"
      >
        i
      </button>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowInfoModal(false)}>
          <div className="bg-gray-800 p-8 rounded-lg max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-white mb-4">Disclaimer</h2>
            <p className="text-gray-300 mb-4">
              This site is meant for entertainment purposes only. Nothing here is serious and I don't break any copyright laws or claim ownership of any images, logos, or content used.
            </p>
            <p className="text-gray-300 mb-6">
              All content created is for parody, satire, and educational purposes.
            </p>
            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="ml-96 flex-1 p-8">
        {/* Billboard Canvas */}
        <div className="relative inline-block" ref={billboardImageRef} style={{ lineHeight: 0 }}>
          <svg width="0" height="0" className="absolute">
            <defs>
              <clipPath id="billboard-mask" clipPathUnits="objectBoundingBox">
                {/* Billboard shape from provided SVG, normalized to 0-1 */}
                <path d="M 0.0389 0.9944 C 0.0731 0.5730 0.0262 0.1798 0.0009 0.0014 L 0.9986 0.0014 C 0.9682 0.1469 0.9173 0.5498 0.9563 0.9972 L 0.0389 0.9944 Z" />
              </clipPath>
              <linearGradient id="billboard-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#000000', stopOpacity: 0.2 }} />
                <stop offset="48%" style={{ stopColor: '#666666', stopOpacity: 0.3 }} />
                <stop offset="52%" style={{ stopColor: '#666666', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: '#000000', stopOpacity: 0.2 }} />
              </linearGradient>
            </defs>
          </svg>

          <img
            src="/billboard.png"
            alt="Billboard Background"
            className="w-full h-auto block"
            style={{ display: 'block' }}
            onLoad={(e) => {
              const img = e.target as HTMLImageElement;
              const rect = img.getBoundingClientRect();
              // Update bounds when image loads
              if (billboardRef.current) {
                const billboardRect = billboardRef.current.getBoundingClientRect();
                setBillboardBounds({
                  left: billboardRect.left,
                  top: billboardRect.top,
                  right: billboardRect.left + billboardRect.width,
                  bottom: billboardRect.top + billboardRect.height,
                });
              }
            }}
            onError={(e) => {
              // Fallback to a colored rectangle if image not found
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {/* Billboard area overlay - positioned absolutely over the image */}
          <div
            ref={billboardRef}
            className="absolute"
            style={{
              position: 'absolute',
              left: '18.5%',
              top: '20.5%',
              width: '63%',
              height: '42.75%',
              clipPath: 'url(#billboard-mask)',
            }}
          >
            {elements.map((element) => (
              <DraggableElement
                key={element.id}
                id={element.id}
                initialX={element.x - billboardBounds.left}
                initialY={element.y - billboardBounds.top}
                initialWidth={element.width}
                initialHeight={element.height}
                bounds={{
                  left: 0,
                  top: 0,
                  right: billboardRef.current?.offsetWidth || 800,
                  bottom: billboardRef.current?.offsetHeight || 600,
                }}
                onUpdate={updateElement}
                isSelected={selectedElement === element.id}
                onSelect={setSelectedElement}
              >
                {element.type === 'text' ? (
                  <div
                    className="tiptap w-full h-full overflow-hidden pointer-events-none"
                    style={{ textTransform: 'uppercase', color: '#D8D8C7' }}
                    dangerouslySetInnerHTML={{ __html: element.htmlContent || element.content }}
                  />
                ) : (
                  <img
                    src={element.content}
                    alt={element.type}
                    className="w-full h-full object-contain"
                  />
                )}
              </DraggableElement>
            ))}
          </div>

          {/* SVG Gradient Overlay */}
          <svg
            className="absolute pointer-events-none"
            style={{
              position: 'absolute',
              left: '18.5%',
              top: '20.5%',
              width: '63%',
              height: '42.75%',
            }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              d="M 3.89 99.44 C 7.31 57.30 2.62 17.98 0.09 0.14 L 99.86 0.14 C 96.82 14.69 91.73 54.98 95.63 99.72 L 3.89 99.44 Z"
              fill="url(#billboard-gradient)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
