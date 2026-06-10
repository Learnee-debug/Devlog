const PALETTE = [
  '#6C63FF','#8b5cf6','#06b6d4','#0ea5e9','#10b981','#f59e0b',
];

function getColor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

const SIZES = { xs: 20, sm: 28, md: 36, lg: 44 };
const FONT  = { xs: 9,  sm: 11, md: 14, lg: 16 };

export default function Avatar({ user, size = 'sm', borderColor = 'var(--color-surface)' }) {
  const px = SIZES[size] ?? 28;
  const fs = FONT[size] ?? 11;
  const initials = user?.name
    ?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        title={user.name}
        style={{
          width: px, height: px, borderRadius: '50%',
          objectFit: 'cover', flexShrink: 0,
          border: `2px solid ${borderColor}`,
        }}
      />
    );
  }

  return (
    <div
      title={user?.name}
      style={{
        width: px, height: px, borderRadius: '50%',
        background: getColor(user?.name),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: fs, fontWeight: 700, color: '#fff',
        flexShrink: 0,
        border: `2px solid ${borderColor}`,
      }}
    >
      {initials}
    </div>
  );
}
