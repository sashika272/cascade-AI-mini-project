import React, { createContext, useContext, useState, useEffect } from 'react';

interface RouterContextType {
  pathname: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType | null>(null);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialPath = () => {
    const hash = window.location.hash.replace('#', '');
    return hash || window.location.pathname || '/';
  };

  const [pathname, setPathname] = useState<string>(getInitialPath);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      setPathname(hash || '/');
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  const navigate = (to: string) => {
    const cleanTo = to.startsWith('/') ? to : `/${to}`;
    window.location.hash = cleanTo;
    setPathname(cleanTo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <RouterContext.Provider value={{ pathname, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within a RouterProvider');
  return ctx;
};

export const useNavigate = () => {
  const { navigate } = useRouter();
  return navigate;
};

export const useLocation = () => {
  const { pathname } = useRouter();
  return { pathname, search: '', hash: window.location.hash };
};

export const Link: React.FC<{
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ to, children, className = '', onClick }) => {
  const { navigate } = useRouter();
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={e => {
        e.preventDefault();
        if (onClick) onClick();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
};

export const NavLink: React.FC<{
  to: string;
  children: React.ReactNode | ((props: { isActive: boolean }) => React.ReactNode);
  className?: string | ((props: { isActive: boolean }) => string);
}> = ({ to, children, className }) => {
  const { pathname, navigate } = useRouter();
  const isActive = pathname === to || (to !== '/' && pathname.startsWith(to));

  const computedClassName =
    typeof className === 'function' ? className({ isActive }) : className;

  return (
    <a
      href={`#${to}`}
      className={computedClassName}
      onClick={e => {
        e.preventDefault();
        navigate(to);
      }}
    >
      {typeof children === 'function' ? children({ isActive }) : children}
    </a>
  );
};

export const OutletContext = createContext<React.ReactNode>(null);

export const Outlet: React.FC = () => {
  const content = useContext(OutletContext);
  return <>{content}</>;
};
