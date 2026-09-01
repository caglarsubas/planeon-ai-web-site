import glossary from '@/data/glossary.json';

export function Term({ children, id }: { children: React.ReactNode; id: keyof typeof glossary }) {
  return <button type="button" className="term">{children}<span role="tooltip">{glossary[id]}</span><span className="sr-only">: {glossary[id]}</span></button>;
}
