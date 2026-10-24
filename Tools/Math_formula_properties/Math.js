export class MathUtils {
  static Pi = Math.PI;
  static Pi1 = 3.142;
  static Pi2 = 22 / 7;
  static e = Math.E;

  static MtoKM(value) {
    return value / 1000;
  }

  static MtoCM(value) {
    return value * 100;
  }

  static CMtoM(value) {
    return value / 100;
  }

  static CMtoKM(value) {
    return value / 100000;
  }

  static KMtoM(value) {
    return value * 1000;
  }

  static areaOfSquare(side) {
    return side * side;
  }

  static perimeterOfSquare(side) {
    return 4 * side;
  }

  static areaOfRectangle(length, width) {
    return length * width;
  }

  static perimeterOfRectangle(length, width) {
    return 2 * (length + width);
  }

  static areaOfTriangle(base, height) {
    return 0.5 * base * height;
  }

  static perimeterOfTriangle(a, b, c) {
    return a + b + c;
  }

  static areaOfCircle(radius) {
    return Math.PI * radius * radius;
  }

  static circumferenceOfCircle(radius) {
    return 2 * Math.PI * radius;
  }

  static volumeOfCube(side) {
    return side ** 3;
  }

  static surfaceAreaOfCube(side) {
    return 6 * side * side;
  }

  static volumeOfCuboid(length, width, height) {
    return length * width * height;
  }

  static surfaceAreaOfCuboid(length, width, height) {
    return 2 * (length * width + length * height + width * height);
  }

  static volumeOfSphere(radius) {
    return (4 / 3) * Math.PI * radius ** 3;
  }

  static surfaceAreaOfSphere(radius) {
    return 4 * Math.PI * radius ** 2;
  }

  static volumeOfCylinder(radius, height) {
    return Math.PI * radius * radius * height;
  }

  static surfaceAreaOfCylinder(radius, height) {
    return 2 * Math.PI * radius * (height + radius);
  }

  static lateralSurfaceAreaOfCylinder(radius, height) {
    return 2 * Math.PI * radius * height;
  }

  static volumeOfCone(radius, height) {
    return (1 / 3) * Math.PI * radius ** 2 * height;
  }

  static slantHeightOfCone(radius, height) {
    return Math.sqrt(radius ** 2 + height ** 2);
  }

  static surfaceAreaOfCone(radius, height) {
    const slantHeight = this.slantHeightOfCone(radius, height);
    return Math.PI * radius * (radius + slantHeight);
  }

  static lateralSurfaceAreaOfCone(radius, height) {
    const slantHeight = this.slantHeightOfCone(radius, height);
    return Math.PI * radius * slantHeight;
  }

  static volumeOfHemisphere(radius) {
    return (2 / 3) * Math.PI * radius ** 3;
  }

  static surfaceAreaOfHemisphere(radius) {
    return 2 * Math.PI * radius ** 2;
  }

  static pythagoreanTheorem(a, b) {
    return Math.sqrt(a ** 2 + b ** 2);
  }

  static isPrime(value) {
    if (value <= 1) {
      return false;
    }

    const limit = Math.sqrt(value);
    for (let i = 2; i <= limit; i += 1) {
      if (value % i === 0) {
        return false;
      }
    }
    return true;
  }

  static quadraticRoots(a, b, c) {
    const discriminant = b ** 2 - 4 * a * c;
    if (discriminant < 0) {
      return null;
    }

    const sqrtDiscriminant = Math.sqrt(discriminant);
    return [
      (-b + sqrtDiscriminant) / (2 * a),
      (-b - sqrtDiscriminant) / (2 * a),
    ];
  }

  static simpleInterest(principal, ratePercent, timeYears) {
    return (principal * ratePercent * timeYears) / 100;
  }

  static compoundInterest(principal, ratePercent, periodsPerYear, years) {
    const annualRate = ratePercent / 100;
    return principal * (1 + annualRate / periodsPerYear) ** (periodsPerYear * years);
  }

  static arithmeticSequenceTerm(firstTerm, commonDifference, termNumber) {
    return firstTerm + (termNumber - 1) * commonDifference;
  }

  static geometricSequenceTerm(firstTerm, commonRatio, termNumber) {
    return firstTerm * commonRatio ** (termNumber - 1);
  }

  static percentageChange(original, newValue) {
    if (original === 0) {
      return NaN;
    }
    return ((newValue - original) / original) * 100;
  }

  static mean(values) {
    if (!Array.isArray(values) || values.length === 0) {
      return NaN;
    }
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  static median(values) {
    if (!Array.isArray(values) || values.length === 0) {
      return NaN;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const midpoint = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[midpoint - 1] + sorted[midpoint]) / 2;
    }

    return sorted[midpoint];
  }

  static distanceBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }
}
