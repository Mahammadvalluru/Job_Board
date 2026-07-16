import './PageContainer.css';

export default function PageContainer({ children, size = 'default', className = '' }) {
  return (
    <main className={`page-container page-container--${size} ${className}`}>
      {children}
    </main>
  );
}
