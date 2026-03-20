interface BadgeProps {
  label: string;
  variant?: 'green' | 'red' | 'yellow' | 'gray' | 'blue';
}

const variants = {
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  gray: 'bg-gray-100 text-gray-600',
  blue: 'bg-blue-100 text-blue-700',
};

export function Badge({ label, variant = 'gray' }: BadgeProps) {
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${variants[variant]}`}>
      {label}
    </span>
  );
}
