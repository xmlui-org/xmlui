import React from 'react';
import { ToneSwitch } from './ToneSwitch';

// Simple test component to verify ToneSwitch works
export function ToneSwitchTest() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>ToneSwitch Component Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Default ToneSwitch (with icons)</h3>
        <ToneSwitch />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>ToneSwitch without icons</h3>
        <ToneSwitch showIcons={false} />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>ToneSwitch with custom icons</h3>
        <ToneSwitch lightIcon="brightness" darkIcon="nightMode" />
      </div>
    </div>
  );
}
