declare global {
  namespace App {
    interface Locals {
      adminAuthenticated: boolean;
    }
    interface Error {
      message: string;
    }
  }
}

export {};
