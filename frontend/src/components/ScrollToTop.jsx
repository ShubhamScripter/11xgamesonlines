import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls the main layout container (or window) to top on route change.
 */
function ScrollToTop({ scrollContainerRef }) {
  const { pathname } = useLocation();

  useEffect(() => {
    const el = scrollContainerRef?.current;
    if (el) {
      el.scrollTop = 0;
      el.scrollLeft = 0;
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, scrollContainerRef]);

  return null;
}

export default ScrollToTop;
