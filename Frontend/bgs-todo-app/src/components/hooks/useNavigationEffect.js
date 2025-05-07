import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useNavigationEffect = (callback) => {
  const location = useLocation();
  
  useEffect(() => {
    callback();
  }, [location.pathname, callback]);
};

export default useNavigationEffect;