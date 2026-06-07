import { useState, useEffect } from 'react';

export default function useImage(src: string | undefined): HTMLImageElement | undefined {
  const [image, setImage] = useState<HTMLImageElement | undefined>();

  useEffect(() => {
    if (!src) { setImage(undefined); return; }
    const img = new window.Image();
    img.onload = () => setImage(img);
    img.onerror = () => setImage(undefined);
    img.src = src;
  }, [src]);

  return image;
}
