import { render, screen } from '@testing-library/react'
import Home from '../src/app/page'
import { Providers } from '../src/components/Providers'
import '@testing-library/jest-dom'

// Mock next/link
jest.mock('next/link', () => {
    return ({ children }: { children: React.ReactNode }) => {
        return children;
    }
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
    usePathname: () => '/',
}));

describe('Home', () => {
    it('renders a heading', () => {
        render(
            <Providers>
                <Home />
            </Providers>
        )
        // There are multiple headings, let's look for a specific one or just any heading
        const headings = screen.getAllByRole('heading')
        expect(headings.length).toBeGreaterThan(0)
    })
})
