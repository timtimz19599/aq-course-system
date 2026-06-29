import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { assignColor, PRESET_COLORS } from '@/utils/colorUtils';

const DEFAULT_ADMIN_HASH = 'cd2ab73c91e09e96a59c75460f1c46ed2d6a03a313c9ac93116f2e2710fc2cbf';

// Bump this version whenever DEFAULT_ADMIN_HASH changes — forces a reset of stored hash
const SETTINGS_VERSION = 5;

interface SettingsState {
  adminPasswordHash: string;
  teacherColorMap: Record<string, string>;
  setAdminPasswordHash: (hash: string) => void;
  getTeacherColor: (username: string) => string;
  ensureTeacherColor: (username: string) => void;
  getAllColors: () => string[];
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      adminPasswordHash: DEFAULT_ADMIN_HASH,
      teacherColorMap: {},

      setAdminPasswordHash: (hash) => set({ adminPasswordHash: hash }),

      getTeacherColor: (username) => {
        const { teacherColorMap } = get();
        return teacherColorMap[username] ?? PRESET_COLORS[0];
      },

      ensureTeacherColor: (username) => {
        const { teacherColorMap } = get();
        if (!teacherColorMap[username]) {
          const color = assignColor(username, teacherColorMap);
          set({ teacherColorMap: { ...teacherColorMap, [username]: color } });
        }
      },

      getAllColors: () => PRESET_COLORS,
    }),
    {
      name: 'aq_settings',
      version: SETTINGS_VERSION,
      // On version mismatch: reset adminPasswordHash to current default, keep teacherColorMap
      migrate: (stored, _version) => {
        const prev = stored as Partial<SettingsState>;
        return {
          adminPasswordHash: DEFAULT_ADMIN_HASH,
          teacherColorMap: prev.teacherColorMap ?? {},
        };
      },
    }
  )
);
