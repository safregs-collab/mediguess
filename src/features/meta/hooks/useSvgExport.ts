import { useCallback } from 'react';

/**
 * SVG → PNG export hook for graph components.
 */
export function useSvgExport() {
  const exportSvg = useCallback((svgElement: SVGSVGElement, filename: string) => {
    const svg = svgElement.cloneNode(true) as SVGSVGElement;
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svg);
    // Ensure xmlns is present for standalone rendering
    if (!svgString.includes('xmlns=')) {
      svgString = svgString.replace(/<svg/, `<svg xmlns="http://www.w3.org/2000/svg"`);
    }
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    const rect = svgElement.getBoundingClientRect();
    const scale = 2; // 2x for retina quality
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      // Fill background (SVG is transparent by default)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return;
        const pngUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(pngUrl);
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      console.error('Failed to export SVG to PNG');
    };
    img.src = url;
  }, []);

  return { exportSvg };
}
