export class PrimitiveRootFinder {
    static findPrimitiveRoots(p) {
      const roots = [];
      const phi = p - 1;
      const factors = this.getPrimeFactors(phi);
  
      for (let g = 2; g < p; g++) {
        let isPrimitiveRoot = true;
        for (const factor of factors) {
          if (this.fastExp(g, phi / factor, p) === 1) {
            isPrimitiveRoot = false;
            break;
          }
        }
        if (isPrimitiveRoot) roots.push(g);
      }
      return roots;
    }
  
    static getPrimeFactors(n) {
      const factors = [];
      for (let i = 2; i <= n; i++) {
        while (n % i === 0) {
          if (!factors.includes(i)) factors.push(i);
          n /= i;
        }
      }
      return factors;
    }
  
    static fastExp(a, z, n) {
      // Альтернативная реализация без BigInt
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
  }