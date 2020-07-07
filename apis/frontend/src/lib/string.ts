export function keepOnlyAlphaNumeric(string: string): string {
	return string.replace(/[^a-z0-9]/gi, '')
}
