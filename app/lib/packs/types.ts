export interface ToolPack {
	id: string;
	name: string;
	description: string;
	read: string[];
	write: string[];
	singleToggle?: boolean;
}

export interface WebPack {
	id: string;
	name: string;
	description: string;
	domains: string[];
	rules?: string[];
}
