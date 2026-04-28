import React, { useState } from 'react';
import { AppThemeProvider, useAppTheme } from '../theme/AppTheme';
import {
  ThemedScreen,
  GlassCard,
  ThemedButton,
  ThemedInput,
  TabBar,
  MetricCard,
  ListRow,
  BottomTabBar,
  ThemeToggle,
} from '../components/UIKit';

function DemoContent() {
  const { colors } = useAppTheme();
  const [tab, setTab] = useState('overview');
  const [bottom, setBottom] = useState('home');
  const [name, setName] = useState('');

  return (
    <ThemedScreen
      scroll
      contentStyle={undefined}
      header={
        <div className="flex items-center justify-between p-6"> 
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>Pulse Hub UI Kit</p>
            <h1 className="text-3xl font-black mt-1" style={{ color: colors.text }}>Retro glass system</h1>
          </div>
          <ThemeToggle />
        </div>
      }
      footer={
        <BottomTabBar
          activeKey={bottom}
          onChange={setBottom}
          items={[
            { key: 'home', label: 'Home', icon: '🏠' },
            { key: 'stats', label: 'Stats', icon: '📈' },
            { key: 'chat', label: 'Chat', icon: '✉️' },
            { key: 'gear', label: 'Settings', icon: '⚙️' },
          ]}
        />
      }
    >
      <TabBar
        tabs={[
          { key: 'overview', label: 'Overview' },
          { key: 'forms', label: 'Forms' },
          { key: 'cards', label: 'Cards' },
        ]}
        activeKey={tab}
        onChange={setTab}
        style={{ marginBottom: 20 }}
      />

      <div className="flex gap-4 mb-4">
        <MetricCard title="Active balance" value="$3,075" meta="Last 30 days" trend="+14%" style={{ flex: 1 }} />
        <MetricCard title="Goal ring" value="$1,450" meta="of $2,000" trend="72%" style={{ flex: 1 }} />
      </div>

      <GlassCard title="Primary actions" subtitle="Buttons tuned for light and dark mode" style={undefined} right={undefined}>
        <div className="flex gap-3 mt-3">
          <ThemedButton label="Primary" onPress={() => {}} style={undefined} left={undefined} />
          <ThemedButton label="Secondary" variant="secondary" onPress={() => {}} style={undefined} left={undefined} />
        </div>
        <div className="flex gap-3 mt-3">
          <ThemedButton label="Ghost" variant="ghost" onPress={() => {}} style={undefined} left={undefined} />
          <ThemedButton label="Danger" variant="danger" onPress={() => {}} style={undefined} left={undefined} />
        </div>
      </GlassCard>

      <GlassCard title="Inputs" subtitle="Soft glass inputs with strong text contrast" style={undefined} right={undefined}>
        <ThemedInput
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          hint="This style works for settings, profile, and onboarding forms."
          error={undefined}
          left={undefined}
          right={undefined}
          style={undefined}
          inputStyle={undefined}
        />
        <div className="h-3" />
        <ThemedInput
          label="Email"
          placeholder="you@example.com"
          error="Example error state styling"
          hint={undefined}
          left={undefined}
          right={undefined}
          style={undefined}
          inputStyle={undefined}
        />
      </GlassCard>

      <GlassCard title="List rows" subtitle="Settings rows, account rows, or message threads" style={undefined} right={undefined}>
        <ListRow title="Notifications" subtitle="Push alerts enabled" value="On" active onPress={() => {}} />
        <ListRow title="Privacy" subtitle="Therapist visibility and sharing" value="Review" active={false} onPress={() => {}} />
        <ListRow title="Safety plan" subtitle="Last edited 2 days ago" value="Open" active={false} onPress={() => {}} />
      </GlassCard>
    </ThemedScreen>
  );
}

export default function UIKitShowcaseScreen() {
  return (
    <AppThemeProvider>
      <DemoContent />
    </AppThemeProvider>
  );
}
