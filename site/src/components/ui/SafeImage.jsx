import { useEffect, useMemo, useState } from 'react';
import tourPlaceholder from '../../assets/tour-placeholder.svg';
import { resolveMediaUrl } from '../../utils/media';

const SafeImage = ({ src, fallbackSrc = tourPlaceholder, onError, ...imageProps }) => {
  const resolvedSrc = useMemo(() => resolveMediaUrl(src), [src]);
  const [currentSrc, setCurrentSrc] = useState(resolvedSrc || fallbackSrc);

  useEffect(() => {
    setCurrentSrc(resolvedSrc || fallbackSrc);
  }, [fallbackSrc, resolvedSrc]);

  const handleError = (event) => {
    onError?.(event);

    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
  };

  return <img {...imageProps} src={currentSrc} onError={handleError} />;
};

export default SafeImage;
