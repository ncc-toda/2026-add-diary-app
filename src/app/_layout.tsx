import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';

import { EntriesProvider } from '../store/entries';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <EntriesProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="new" options={{ presentation: 'modal' }} />
        </Stack>
      </EntriesProvider>
    </QueryClientProvider>
  );
}
