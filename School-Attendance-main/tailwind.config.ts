import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Apple-inspired neutral grays
				apple: {
					gray: {
						50: '#fafafa',
						100: '#f5f5f7',
						200: '#e8e8ed',
						300: '#d2d2d7',
						400: '#86868b',
						500: '#6e6e73',
						600: '#515154',
						700: '#424245',
						800: '#1d1d1f',
						900: '#000000',
					},
					blue: '#0071e3',
					green: '#34c759',
					red: '#ff3b30',
					orange: '#ff9500',
				},
				school: {
					primary: '#0071e3',
					secondary: '#1d1d1f',
					accent: '#0071e3',
					light: '#f5f5f7',
					dark: '#1d1d1f',
					success: '#34c759',
					warning: '#ff9500',
					danger: '#ff3b30',
					info: '#0071e3',
					gray: '#86868b'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'apple': '12px',
				'apple-lg': '18px',
				'apple-xl': '22px',
				'apple-full': '980px',
			},
			keyframes: {
				'fade-in-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
					},
					'100%': {
						opacity: '1',
					}
				},
				'fade-out': {
					'0%': {
						opacity: '1',
					},
					'100%': {
						opacity: '0',
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.98)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'slide-up': {
					'0%': {
						transform: 'translateY(8px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'accordion-down': {
					from: {
						height: '0',
						opacity: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)',
						opacity: '1'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)',
						opacity: '1'
					},
					to: {
						height: '0',
						opacity: '0'
					}
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'fade-in-up': 'fade-in-up 0.6s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'slide-up': 'slide-up 0.4s ease-out',
				enter: 'fade-in 0.3s ease-out, scale-in 0.2s ease-out',
				exit: 'fade-out 0.2s ease-out',
			},
			boxShadow: {
				'2xs': '0 1px 2px 0 rgb(0 0 0 / 0.03)',
				'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
				'sm': '0 1px 3px 0 rgb(0 0 0 / 0.08)',
				'md': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
				'lg': '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
				'xl': '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
				'2xl': '0 25px 50px -12px rgb(0 0 0 / 0.15)',
				'apple': '0 4px 12px rgba(0, 0, 0, 0.08)',
				'apple-lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
				'apple-hover': '0 8px 32px rgba(0, 0, 0, 0.12)',
				'apple-card': '0 2px 8px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.06)',
			},
			fontFamily: {
				sans: [
					'Inter',
					'-apple-system',
					'BlinkMacSystemFont',
					'SF Pro Display',
					'SF Pro Text',
					'Helvetica Neue',
					'Helvetica',
					'Arial',
					'sans-serif'
				],
				display: [
					'SF Pro Display',
					'Inter',
					'-apple-system',
					'BlinkMacSystemFont',
					'Helvetica Neue',
					'sans-serif'
				],
			},
			fontSize: {
				'apple-xs': ['12px', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
				'apple-sm': ['14px', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
				'apple-base': ['17px', { lineHeight: '1.5', letterSpacing: '-0.022em' }],
				'apple-lg': ['21px', { lineHeight: '1.4', letterSpacing: '-0.022em' }],
				'apple-xl': ['28px', { lineHeight: '1.2', letterSpacing: '-0.026em' }],
				'apple-2xl': ['40px', { lineHeight: '1.1', letterSpacing: '-0.028em' }],
				'apple-3xl': ['48px', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
				'apple-4xl': ['64px', { lineHeight: '1.0', letterSpacing: '-0.032em' }],
				'apple-hero': ['80px', { lineHeight: '1.0', letterSpacing: '-0.04em' }],
			},
			spacing: {
				'apple-xs': '8px',
				'apple-sm': '12px',
				'apple-md': '16px',
				'apple-lg': '24px',
				'apple-xl': '32px',
				'apple-2xl': '48px',
				'apple-3xl': '64px',
				'apple-section': '120px',
			},
			backdropBlur: {
				'apple': '20px',
			},
			transitionTimingFunction: {
				'apple': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
				'apple-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
			},
			transitionDuration: {
				'apple': '300ms',
				'apple-fast': '150ms',
				'apple-slow': '500ms',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
