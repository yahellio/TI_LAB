export class ElGamal {
  constructor() {
    this.P = 0;
    this.G = 0;
    this.Y = 0;
    this.X = 0;
  }

  generateKeys(p, g, x) {
    if (x <= 1 || x >= p - 1) {
      throw new Error("Private key x must be: 1 < x < p-1");
    }

    this.P = p;
    this.G = g;
    this.X = x;
    this.Y = this.fastExp(g, x, p);
  }

  encrypt(m, k) {
    if (m < 0 || m >= this.P) {
      throw new Error(`Message m=${m} is out of bounds [0, ${this.P - 1}]`);
    }

    if (k <= 1 || k >= this.P - 1) {
      throw new Error(`Random number k must be: 1 < k < ${this.P - 1}`);
    }

    const a = this.fastExp(this.G, k, this.P);
    const b = (this.fastExp(this.Y, k, this.P) * m) % this.P;
    return { a, b };
  }

  decrypt(a, b) {
    const ax = this.fastExp(a, this.X, this.P);
    const axInv = this.fastExp(ax, this.P - 2, this.P);
    const decrypted = (b * axInv) % this.P;
    
    if (decrypted < 0 || decrypted >= this.P) {
      throw new Error(`Decrypted value ${decrypted} is out of range [0, ${this.P - 1}]`);
    }

    return decrypted;
  }

  fastExp(a, z, n) {
    let result = 1;
    a = a % n;
    
    while (z > 0) {
      if (z % 2 === 1) {
        result = (result * a) % n;
      }
      z = Math.floor(z / 2);
      a = (a * a) % n;
    }
    
    return result;
  }

  static gcd(a, b) {
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }
}