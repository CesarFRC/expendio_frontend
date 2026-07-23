export function StatCard({ icon: Icon, label, value, gradient, sublabel }) {
  return (
    <div className="stat-card animate-fadeInUp">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
          </p>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--text-primary)' }}>
            {value}
          </p>
          {sublabel && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {sublabel}
            </p>
          )}
        </div>
        <div
          className={gradient}
          style={{
            width: 44, height: 44, borderRadius: '0.75rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={22} color="#fff" />
        </div>
      </div>
    </div>
  );
}
