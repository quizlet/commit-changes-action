export async function wait(milliseconds: number): Promise<string> {
  return new Promise(resolve => {
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(milliseconds)) {
      throw new Error('milliseconds not a number');
    }

    setTimeout(() => resolve('done!'), milliseconds);
  });
}
