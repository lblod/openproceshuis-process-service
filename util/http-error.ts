export class HttpError extends Error {
  constructor(
    message: string,
    public status?: number,
    public description?: string[],
  ) {
    super(message);

    if (!this.status) {
      this.status = 500; // Internal server error
    }
    if (!this.description) {
      this.description = null;
    }
    console.log('\n Http error: ', this.message);
  }
}
