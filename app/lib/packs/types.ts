export interface ToolPack {
	id: string;
	name: string;
	description: string;
	url?: string;
	readOnly: string[];
	readWrite: string[];
}

export interface WebPack {
	id: string;
	name: string;
	description: string;
	domains: string[];
	rules?: string[];
}
