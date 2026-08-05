import { create } from 'zustand';

export type ActivitySection = 'dashboard' | 'projects' | 'review' | 'github' | 'history' | 'analytics' | 'settings';

export type BottomTab = 'problems' | 'output' | 'terminal' | 'review';

interface UIState {
  activeSection: ActivitySection;
  sidebarOpen: boolean;
  bottomPanelOpen: boolean;
  bottomTab: BottomTab;
  commandPaletteOpen: boolean;
  theme: 'dark' | 'light';
  notifications: { id: string; title: string; message: string; type: 'info' | 'success' | 'warning' | 'error'; time: string }[];
  
  // Actions
  setActiveSection: (section: ActivitySection) => void;
  toggleSidebar: () => void;
  toggleBottomPanel: () => void;
  setBottomTab: (tab: BottomTab) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  addNotification: (notification: { title: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }) => void;
  dismissNotification: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeSection: 'dashboard',
  sidebarOpen: true,
  bottomPanelOpen: true,
  bottomTab: 'problems',
  commandPaletteOpen: false,
  theme: 'dark',
  notifications: [
    {
      id: 'n1',
      title: 'Review Complete',
      message: 'AI Code Review finished for AI-Code-Review system with score 92%',
      type: 'success',
      time: '2m ago'
    },
    {
      id: 'n2',
      title: 'GitHub Synced',
      message: 'Connected repository uttammaji/ai-code-review-system',
      type: 'info',
      time: '1h ago'
    }
  ],

  setActiveSection: (section) => set({ activeSection: section }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleBottomPanel: () => set((state) => ({ bottomPanelOpen: !state.bottomPanelOpen })),
  setBottomTab: (tab) => set({ bottomTab: tab, bottomPanelOpen: true }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  
  addNotification: (n) => set((state) => ({
    notifications: [
      { id: 'notif_' + Date.now(), ...n, time: 'Just now' },
      ...state.notifications
    ]
  })),

  dismissNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(item => item.id !== id)
  }))
}));
