import { TOOL_PACKS } from "./tool-packs";
import { WEB_PACKS } from "./web-packs";

export type { ToolPack, WebPack } from "./types";
export { TOOL_PACKS } from "./tool-packs";
export { WEB_PACKS } from "./web-packs";

export interface PackState {
	id: string;
	read: boolean;
	write: boolean;
}

export function getPackState(packId: string, rules: string[]): PackState {
	const pack = TOOL_PACKS.find(p => p.id === packId);
	if (!pack) return { id: packId, read: false, write: false };

	const rulesSet = new Set(rules);
	const hasAllRead = pack.read.length > 0 && pack.read.every(r => rulesSet.has(r));
	const hasAllWrite = pack.write.length > 0 && pack.write.every(r => rulesSet.has(r));

	return {
		id: packId,
		read: hasAllRead,
		write: hasAllWrite || (pack.singleToggle === true && hasAllRead),
	};
}

export function getWebPackState(packId: string, rules: string[]): boolean {
	const pack = WEB_PACKS.find(p => p.id === packId);
	if (!pack) return false;

	const rulesSet = new Set(rules);

	const domainRules = pack.domains.map(d => `WebFetch(domain:${d})`);
	const allRules = [...domainRules, ...(pack.rules || [])];

	return allRules.length > 0 && allRules.every(r => rulesSet.has(r));
}

export function togglePack(
	packId: string,
	field: "read" | "write",
	enabled: boolean,
	currentRules: string[]
): string[] {
	const pack = TOOL_PACKS.find(p => p.id === packId);
	if (!pack) return currentRules;

	const rulesSet = new Set(currentRules);

	if (pack.singleToggle) {
		if (enabled) {
			pack.read.forEach(r => rulesSet.add(r));
		} else {
			pack.read.forEach(r => rulesSet.delete(r));
		}
	} else {
		if (field === "read") {
			if (enabled) {
				pack.read.forEach(r => rulesSet.add(r));
			} else {
				pack.read.forEach(r => rulesSet.delete(r));
			}
		} else {
			if (enabled) {
				pack.write.forEach(r => rulesSet.add(r));
			} else {
				pack.write.forEach(r => rulesSet.delete(r));
			}
		}
	}

	return [...rulesSet];
}

export function toggleWebPack(
	packId: string,
	enabled: boolean,
	currentRules: string[]
): string[] {
	const pack = WEB_PACKS.find(p => p.id === packId);
	if (!pack) return currentRules;

	const rulesSet = new Set(currentRules);
	const domainRules = pack.domains.map(d => `WebFetch(domain:${d})`);
	const allRules = [...domainRules, ...(pack.rules || [])];

	if (enabled) {
		allRules.forEach(r => rulesSet.add(r));
	} else {
		allRules.forEach(r => rulesSet.delete(r));
	}

	return [...rulesSet];
}

export function getPackRules(rules: string[]): Set<string> {
	const packRules = new Set<string>();

	for (const pack of TOOL_PACKS) {
		const state = getPackState(pack.id, rules);
		if (state.read) {
			pack.read.forEach(r => packRules.add(r));
		}
		if (state.write) {
			pack.write.forEach(r => packRules.add(r));
		}
	}

	for (const pack of WEB_PACKS) {
		if (getWebPackState(pack.id, rules)) {
			pack.domains.forEach(d => packRules.add(`WebFetch(domain:${d})`));
			pack.rules?.forEach(r => packRules.add(r));
		}
	}

	return packRules;
}

export function getRulesWithoutPacks(rules: string[]): string[] {
	const packRules = getPackRules(rules);
	return rules.filter(r => !packRules.has(r));
}
