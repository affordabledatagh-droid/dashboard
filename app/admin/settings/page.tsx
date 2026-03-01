'use client';

import { useState } from 'react';
import { COLORS } from '@/lib/constants/colors';
import { HiCheckCircle } from 'react-icons/hi2';

interface SettingsState {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  defaultCommissionRate: number;
  minWithdrawalAmount: number;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  autoApproveWithdrawals: boolean;
  mtnApiKey: string;
  telecelApiKey: string;
  airtelTigoApiKey: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>({
    platformName: 'DataLink',
    supportEmail: 'support@datalink.com',
    supportPhone: '+233 24 123 4567',
    defaultCommissionRate: 10,
    minWithdrawalAmount: 50,
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: true,
    autoApproveWithdrawals: false,
    mtnApiKey: '••••••••••••••••',
    telecelApiKey: '••••••••••••••••',
    airtelTigoApiKey: '••••••••••••••••',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // API call to save settings
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (key: keyof SettingsState, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div
      style={{
        padding: 'clamp(20px, 4vw, 32px) clamp(16px, 3vw, 24px)',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 'clamp(24px, 4vw, 32px)' }}>
        <h1
          style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: 800,
            color: COLORS.white,
            marginBottom: '8px',
          }}
        >
          Settings
        </h1>
        <p style={{ fontSize: '14px', color: COLORS.muted }}>
          Configure platform settings and preferences
        </p>
      </div>

      {/* Save Success Message */}
      {saved && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: '#22c55e20',
            border: `1.5px solid #22c55e`,
            borderRadius: '8px',
            marginBottom: '24px',
          }}
        >
          <HiCheckCircle size={20} color="#22c55e" />
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#22c55e' }}>
            Settings saved successfully!
          </span>
        </div>
      )}

      {/* General Settings */}
      <div
        style={{
          background: COLORS.surface,
          border: `1.5px solid ${COLORS.border}`,
          borderRadius: '14px',
          padding: 'clamp(16px, 3vw, 24px)',
          marginBottom: 'clamp(16px, 3vw, 24px)',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(18px, 3vw, 20px)',
            fontWeight: 700,
            color: COLORS.white,
            marginBottom: '20px',
          }}
        >
          General Settings
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: '8px' }}>
              Platform Name
            </label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => handleChange('platformName', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: COLORS.bg,
                border: `1.5px solid ${COLORS.border}`,
                borderRadius: '8px',
                color: COLORS.white,
                fontSize: '14px',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: '8px' }}>
              Support Email
            </label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => handleChange('supportEmail', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: COLORS.bg,
                border: `1.5px solid ${COLORS.border}`,
                borderRadius: '8px',
                color: COLORS.white,
                fontSize: '14px',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: '8px' }}>
              Support Phone
            </label>
            <input
              type="tel"
              value={settings.supportPhone}
              onChange={(e) => handleChange('supportPhone', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: COLORS.bg,
                border: `1.5px solid ${COLORS.border}`,
                borderRadius: '8px',
                color: COLORS.white,
                fontSize: '14px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Commission & Payments */}
      <div
        style={{
          background: COLORS.surface,
          border: `1.5px solid ${COLORS.border}`,
          borderRadius: '14px',
          padding: 'clamp(16px, 3vw, 24px)',
          marginBottom: 'clamp(16px, 3vw, 24px)',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(18px, 3vw, 20px)',
            fontWeight: 700,
            color: COLORS.white,
            marginBottom: '20px',
          }}
        >
          Commission & Payments
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: '8px' }}>
              Default Commission Rate (%)
            </label>
            <input
              type="number"
              value={settings.defaultCommissionRate}
              onChange={(e) => handleChange('defaultCommissionRate', Number(e.target.value))}
              min="0"
              max="100"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: COLORS.bg,
                border: `1.5px solid ${COLORS.border}`,
                borderRadius: '8px',
                color: COLORS.white,
                fontSize: '14px',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: '8px' }}>
              Minimum Withdrawal Amount (GH₵)
            </label>
            <input
              type="number"
              value={settings.minWithdrawalAmount}
              onChange={(e) => handleChange('minWithdrawalAmount', Number(e.target.value))}
              min="0"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: COLORS.bg,
                border: `1.5px solid ${COLORS.border}`,
                borderRadius: '8px',
                color: COLORS.white,
                fontSize: '14px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Network API Keys */}
      <div
        style={{
          background: COLORS.surface,
          border: `1.5px solid ${COLORS.border}`,
          borderRadius: '14px',
          padding: 'clamp(16px, 3vw, 24px)',
          marginBottom: 'clamp(16px, 3vw, 24px)',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(18px, 3vw, 20px)',
            fontWeight: 700,
            color: COLORS.white,
            marginBottom: '20px',
          }}
        >
          Network API Keys
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: '8px' }}>
              MTN API Key
            </label>
            <input
              type="password"
              value={settings.mtnApiKey}
              onChange={(e) => handleChange('mtnApiKey', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: COLORS.bg,
                border: `1.5px solid ${COLORS.border}`,
                borderRadius: '8px',
                color: COLORS.white,
                fontSize: '14px',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: '8px' }}>
              Telecel API Key
            </label>
            <input
              type="password"
              value={settings.telecelApiKey}
              onChange={(e) => handleChange('telecelApiKey', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: COLORS.bg,
                border: `1.5px solid ${COLORS.border}`,
                borderRadius: '8px',
                color: COLORS.white,
                fontSize: '14px',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: '8px' }}>
              AirtelTigo API Key
            </label>
            <input
              type="password"
              value={settings.airtelTigoApiKey}
              onChange={(e) => handleChange('airtelTigoApiKey', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: COLORS.bg,
                border: `1.5px solid ${COLORS.border}`,
                borderRadius: '8px',
                color: COLORS.white,
                fontSize: '14px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Notifications & Automation */}
      <div
        style={{
          background: COLORS.surface,
          border: `1.5px solid ${COLORS.border}`,
          borderRadius: '14px',
          padding: 'clamp(16px, 3vw, 24px)',
          marginBottom: 'clamp(16px, 3vw, 24px)',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(18px, 3vw, 20px)',
            fontWeight: 700,
            color: COLORS.white,
            marginBottom: '20px',
          }}
        >
          Notifications & Automation
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { key: 'emailNotifications', label: 'Email Notifications', description: 'Send email notifications to agents and customers' },
            { key: 'smsNotifications', label: 'SMS Notifications', description: 'Send SMS notifications for transactions' },
            { key: 'autoApproveWithdrawals', label: 'Auto-Approve Withdrawals', description: 'Automatically approve withdrawal requests under minimum amount' },
            { key: 'maintenanceMode', label: 'Maintenance Mode', description: 'Put the platform in maintenance mode' },
          ].map((item) => (
            <div
              key={item.key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: COLORS.faint,
                borderRadius: '8px',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: COLORS.white, marginBottom: '4px' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '12px', color: COLORS.muted }}>
                  {item.description}
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                <input
                  type="checkbox"
                  checked={settings[item.key as keyof SettingsState] as boolean}
                  onChange={(e) => handleChange(item.key as keyof SettingsState, e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                  style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: settings[item.key as keyof SettingsState] ? COLORS.blue : COLORS.border,
                    transition: '0.3s',
                    borderRadius: '24px',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      content: '',
                      height: '18px',
                      width: '18px',
                      left: settings[item.key as keyof SettingsState] ? '26px' : '3px',
                      bottom: '3px',
                      background: COLORS.white,
                      transition: '0.3s',
                      borderRadius: '50%',
                    }}
                  />
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          onClick={() => setSettings({
            platformName: 'DataLink',
            supportEmail: 'support@datalink.com',
            supportPhone: '+233 24 123 4567',
            defaultCommissionRate: 10,
            minWithdrawalAmount: 50,
            maintenanceMode: false,
            emailNotifications: true,
            smsNotifications: true,
            autoApproveWithdrawals: false,
            mtnApiKey: '••••••••••••••••',
            telecelApiKey: '••••••••••••••••',
            airtelTigoApiKey: '••••••••••••••••',
          })}
          style={{
            padding: '10px 20px',
            background: COLORS.faint,
            border: `1.5px solid ${COLORS.border}`,
            borderRadius: '8px',
            color: COLORS.white,
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          style={{
            padding: '10px 20px',
            background: COLORS.blue,
            border: 'none',
            borderRadius: '8px',
            color: COLORS.white,
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
