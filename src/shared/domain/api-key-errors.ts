export class MissingApiKeyError extends Error {
  constructor(providerId: string) {
    super(`Add your API key for this provider in Settings.`);
    this.name = "MissingApiKeyError";
  }
}

export class InvalidApiKeyError extends Error {
  constructor(providerId: string) {
    super(`API key rejected for this provider. Check your key in Settings.`);
    this.name = "InvalidApiKeyError";
  }
}
