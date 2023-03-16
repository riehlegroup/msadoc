import chalk from 'chalk';

/**
 * Log an error message.
 */
export function logErrorMessage(message: string): void {
  console.log(chalk.red(message));
}

/**
 * Log a success message.
 */
export function logSuccessMessage(message: string): void {
  console.log(chalk.green(message));
}
