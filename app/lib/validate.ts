import Ajv, { type ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import type { ClaudeCodeSettings } from "./schema";

const SCHEMA_URL = "https://json.schemastore.org/claude-code-settings.json";

let cachedValidator: ValidateFunction | null = null;
let validatorPromise: Promise<ValidateFunction> | null = null;

export interface ValidationError {
	path: string;
	message: string;
}

export interface ValidationResult {
	valid: boolean;
	errors: ValidationError[];
}

async function getValidator(): Promise<ValidateFunction> {
	if (cachedValidator) return cachedValidator;
	if (validatorPromise) return validatorPromise;

	validatorPromise = (async () => {
		const response = await fetch(SCHEMA_URL);
		if (!response.ok) {
			throw new Error(`Failed to fetch schema: ${response.statusText}`);
		}
		const schema = await response.json();
		const ajv = new Ajv({ allErrors: true, verbose: true, strict: false });
		addFormats(ajv);
		cachedValidator = ajv.compile(schema);
		return cachedValidator;
	})();

	return validatorPromise;
}

export async function validateSettings(settings: ClaudeCodeSettings): Promise<ValidationResult> {
	try {
		const validate = await getValidator();
		const valid = validate(settings);

		if (valid) {
			return { valid: true, errors: [] };
		}

		const errors: ValidationError[] = (validate.errors || []).map((error) => ({
			path: error.instancePath || "/",
			message: error.message || "Unknown error",
		}));

		return { valid: false, errors };
	} catch (error) {
		return {
			valid: false,
			errors: [{ path: "/", message: `Schema validation failed: ${error}` }],
		};
	}
}
