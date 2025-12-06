# Frontend Progress — Gym Owner App

**Last updated:** 2025-12-06

| Screen / Task | Status | Owner | Notes |
|---------------|--------|-------|-------|
| Auth: Login Screen | Done ✅ | - | src/screens/Auth/LoginScreen.tsx (StyleSheet) |
| Auth: OTP Login | Not started | - | Placeholder for OTP flow |
| Onboarding / Gym Registration | Not started | - | Mock-only form |
| Dashboard (Owner Home) | Done ✅ | - | src/screens/Dashboard/DashboardScreen.tsx (StyleSheet) |
| Members List | Done ✅ | - | src/screens/Members/MembersListScreen.tsx (StyleSheet) |
| Member Profile | Not started | - | Implement read-only UI |
| Add/Edit Member | Not started | - | Full form with validation |
| Attendance (Scan QR) | Done ✅ | - | app/(tabs)/attendance.tsx (enhanced with real-time list) |
| Attendance (Today List / Calendar) | Done ✅ | - | app/(tabs)/attendance.tsx (today count in header) |
| Payments (History) | Done ✅ | - | app/(tabs)/payments.tsx (enhanced with payment list & totals) |
| Payments (Add) | Not started | - | Mock add-payment form |
| Trainers List & Profile | Not started | - | - |
| Notifications Page | Not started | - | Mock in-app notifications UI |
| Settings (Logout) | Done ✅ | - | app/(tabs)/settings.tsx |
| Design System (Components) | Done ✅ | - | Button, Input, Card (StyleSheet) |
| Demo Data & Mock Services | Done ✅ | - | mockData, hybrid services |
| E2E / Visual Tests | Not started | - | Recommend snapshots later |

## Implementation Notes

- All screens use React Native **StyleSheet** (consistent with existing project)
- Mock services fall back to mock data when Supabase is unavailable
- Theme tokens defined in `src/constants/theme.ts`
- Icons from `lucide-react-native`
- State management via Zustand
