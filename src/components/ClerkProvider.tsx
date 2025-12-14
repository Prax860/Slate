import { ClerkProvider } from '@clerk/nextjs';

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        elements: {
          cardBox: 'bg-slate-900 border border-purple-500/20',
          card: 'bg-slate-900',
          headerTitle: 'text-white',
          headerSubtitle: 'text-gray-400',
          socialButtonsBlockButton: 'border border-purple-500/20 text-gray-300 hover:bg-purple-500/10',
          formButtonPrimary: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
          footerActionLink: 'text-purple-400 hover:text-purple-300',
          dividerLine: 'bg-purple-500/20',
          dividerText: 'text-gray-400',
          formFieldInput: 'bg-slate-800 border-purple-500/20 text-white',
          formFieldLabel: 'text-gray-300',
          identifierMobileIcon: 'text-purple-400',
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
