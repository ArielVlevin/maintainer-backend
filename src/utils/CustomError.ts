export class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class DBError extends CustomError {
  constructor(message = "Database Error") {
    super(message, 500);
  }
}

export class ValidationError extends CustomError {
  constructor(message = "Validation Error") {
    super(message, 400);
  }
}

export class AuthError extends CustomError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}
