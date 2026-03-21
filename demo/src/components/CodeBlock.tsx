interface CodeBlockProps {
  code: string;
  title?: string;
}

export function CodeBlock({ code, title }: CodeBlockProps) {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      {title && (
        <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400 font-mono">{title}</div>
      )}
      <pre className="bg-gray-900 text-gray-100 p-4 text-xs overflow-x-auto font-mono leading-relaxed">
        {code}
      </pre>
    </div>
  );
}
