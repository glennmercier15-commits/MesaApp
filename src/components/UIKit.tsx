import React from 'react';
import { useAppTheme } from '../theme/AppTheme';
import { cn } from '../lib/utils'; // Assuming this utility exists, if not, I'll use template literals

export function ThemedScreen({ children, scroll = false, contentStyle = undefined, header = undefined, footer = undefined }) {
  const { colors } = useAppTheme();
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: colors.background }}>
      {/* Soft blue bubbles */}
      <div className="absolute w-[300px] h-[300px] rounded-full -top-20 -right-20 blur-3xl opacity-30" style={{ backgroundColor: colors.primary }} />
      <div className="absolute w-[250px] h-[250px] rounded-full -bottom-20 -left-20 blur-3xl opacity-20" style={{ backgroundColor: colors.accent }} />
      
      {header}
      <div className={cn("flex-1", scroll ? "overflow-y-auto" : "")}>
        <div className={cn("flex-1 p-5", contentStyle)}>{children}</div>
      </div>
      {footer}
    </div>
  );
}

export function GlassCard({ children, title = undefined, subtitle = undefined, style = undefined, right = undefined, padded = true }) {
  const { colors } = useAppTheme();
  return (
    <div 
      className={cn("border rounded-[16px] mb-4 backdrop-blur-md transition-all duration-300", padded ? "p-5" : "", style)} 
      style={{ 
        backgroundColor: colors.cardGlassStrong, 
        borderColor: colors.border, 
        boxShadow: colors.mode === 'light' ? '0 4px 16px rgba(0,0,0,0.06)' : '0 4px 16px rgba(0,0,0,0.2)' 
      }}
    >
      {(title || subtitle || right) && (
        <div className="flex items-center mb-4">
          <div className="flex-1">
            {title && <h3 className="text-[18px] font-semibold" style={{ color: colors.text }}>{title}</h3>}
            {subtitle && <p className="text-[12px] font-normal mt-1" style={{ color: colors.textMuted }}>{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

export function ThemedButton({ label, onPress, variant = 'primary', disabled = false, style = undefined, left = undefined }) {
  const { colors } = useAppTheme();
  
  const baseStyles = "flex items-center justify-center rounded-[14px] px-6 min-h-[52px] gap-2 transition-all duration-200 active:scale-[0.98] active:opacity-85 font-semibold text-[16px]";
  
  const variants = {
    primary: "text-white shadow-lg teal-glow primary-gradient border-0",
    secondary: "border text-foreground",
    ghost: "bg-transparent border-transparent text-primary",
    danger: "bg-danger border-danger text-white shadow-md",
  };

  const dynamicStyles = variant === 'secondary' ? { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text } : {};

  return (
    <button
      onClick={onPress}
      disabled={disabled}
      className={cn(baseStyles, variants[variant], disabled ? "opacity-50 grayscale" : "", style)}
      style={dynamicStyles}
    >
      {left}
      <span>{label}</span>
    </button>
  );
}

export function ThemedInput({ label = undefined, hint = undefined, error = undefined, left = undefined, right = undefined, style = undefined, inputStyle = undefined, ...props }) {
  const { colors } = useAppTheme();
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div className={cn("space-y-2", style)}>
      {label && <label className="block text-[12px] font-medium uppercase tracking-wider px-1" style={{ color: colors.textMuted }}>{label}</label>}
      <div 
        className={cn(
          "flex items-center border rounded-[12px] px-4 min-h-[52px] transition-all duration-200", 
          error ? "border-danger" : isFocused ? "border-primary ring-1 ring-primary/20" : "border-border"
        )} 
        style={{ backgroundColor: colors.surfaceAlt }}
      >
        {left}
        <input
          className={cn("flex-1 py-3.5 bg-transparent outline-none text-[16px]", inputStyle)}
          style={{ color: colors.text }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {right}
      </div>
      {error ? <p className="px-1 text-[11px] font-medium text-danger">{error}</p> : hint && <p className="px-1 text-[11px] font-medium" style={{ color: colors.textMuted }}>{hint}</p>}
    </div>
  );
}

export function TabBar({ tabs, activeKey, onChange, style }) {
  const { colors } = useAppTheme();
  return (
    <div className={cn("flex border rounded-full p-1", style)} style={{ backgroundColor: colors.cardGlass, borderColor: colors.border }}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn("flex-1 rounded-full py-2 font-semibold", tab.key === activeKey ? "text-white" : "")}
          style={{ backgroundColor: tab.key === activeKey ? colors.primary : 'transparent', color: tab.key === activeKey ? '#FFFFFF' : colors.tabIdle }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function MetricCard({ title, value, meta, trend = '+12%', style }) {
  const { colors } = useAppTheme();
  return (
    <GlassCard style={style}>
      <p className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>{title}</p>
      <p className="text-3xl font-black mb-2" style={{ color: colors.text }}>{value}</p>
      <div className="flex items-center">
        <div className="px-2.5 py-1 rounded-full" style={{ backgroundColor: colors.primary + '1F' }}>
          <span className="font-bold text-xs" style={{ color: colors.primary }}>{trend}</span>
        </div>
        <span className="ml-2 text-xs" style={{ color: colors.textMuted }}>{meta}</span>
      </div>
    </GlassCard>
  );
}

export function ListRow({ title, subtitle = undefined, value = undefined, active = false, onPress = undefined }) {
  const { colors } = useAppTheme();
  return (
    <button
      onClick={onPress}
      className={cn("flex items-center border rounded-2xl p-3 mb-2 w-full text-left", active ? "border-primary" : "")}
      style={{ backgroundColor: active ? colors.primary + '16' : colors.surface, borderColor: active ? colors.primary : colors.border }}
    >
      <div className="flex-1">
        <p className="font-bold" style={{ color: colors.text }}>{title}</p>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: colors.textMuted }}>{subtitle}</p>}
      </div>
      {value && <span className="font-bold" style={{ color: colors.primary }}>{value}</span>}
    </button>
  );
}

export function BottomTabBar({ items, activeKey, onChange }) {
  const { colors } = useAppTheme();
  return (
    <div className="pb-3 px-5">
      <div className="flex justify-between border rounded-full px-4 py-2" style={{ backgroundColor: colors.cardGlassStrong, borderColor: colors.border }}>
        {items.map((item) => (
          <button 
            key={item.key} 
            onClick={() => onChange(item.key)} 
            aria-label={item.label}
            className="flex flex-col items-center flex-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: item.key === activeKey ? colors.primary + '22' : 'transparent' }}>
              <span className="text-xl" style={{ color: item.key === activeKey ? colors.primary : colors.tabIdle }}>{item.icon}</span>
            </div>
            <span className="text-[11px] mt-1" style={{ color: item.key === activeKey ? colors.primary : colors.tabIdle }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ThemeToggle() {
  const { mode, toggleTheme, colors } = useAppTheme();
  return (
    <button
      onClick={toggleTheme}
      className="border rounded-full px-4 py-2 font-bold"
      style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }}
    >
      {mode === 'dark' ? '☾ Dark' : '☀ Light'}
    </button>
  );
}
