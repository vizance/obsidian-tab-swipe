import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * The gesture layer must stay free of Obsidian imports so its threshold rules
 * can be tested without an Obsidian runtime. This guard fails the moment that
 * boundary is crossed, instead of relying on review to catch it.
 */
describe('gesture layer stays independent of Obsidian', () => {
	const gestureSource = readFileSync(
		fileURLToPath(new URL('../src/gesture/navbar-swipe.ts', import.meta.url)),
		'utf8',
	);

	it('does not import the obsidian module', () => {
		expect(gestureSource).not.toMatch(/from\s+['"]obsidian['"]/);
		expect(gestureSource).not.toMatch(/require\(\s*['"]obsidian['"]\s*\)/);
	});

	it('does not import anything at all', () => {
		expect(gestureSource).not.toMatch(/^\s*import\s/m);
	});
});
