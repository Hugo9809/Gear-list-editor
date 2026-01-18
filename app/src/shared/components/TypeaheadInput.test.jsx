import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TypeaheadInput from './TypeaheadInput';

describe('TypeaheadInput', () => {
    it('renders input with placeholder', () => {
        render(<TypeaheadInput value="" onChange={() => { }} suggestions={[]} placeholder="Search..." />);
        expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('filters suggestions based on filtered input', () => {
        const suggestions = [
            { name: 'Apple', lastUsed: '2023' },
            { name: 'Banana', lastUsed: '2022' }
        ];
        render(
            <TypeaheadInput
                value="app"
                onChange={() => { }}
                suggestions={suggestions}
            />
        );

        // Focus to show suggestions
        fireEvent.focus(screen.getByRole('textbox'));

        expect(screen.getByText('Apple')).toBeInTheDocument();
        expect(screen.queryByText('Banana')).not.toBeInTheDocument();
    });
});
