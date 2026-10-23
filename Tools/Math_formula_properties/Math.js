export class MathUtils {
    static MtoKM(a) {
        return a / 1000;
    }
    static MtoCM(a) {
        return a * 100;
    }
    static CMtoM(a) {
        return a / 100;
    }
    static CMtoKM(a) {
        return a * 100000;
    }
    static KMtoM(a) {
        return a * 1000;
    }
    static volumeSphere(radius) {
        return (4 / 3) * Math.PI * Math.pow(radius, 3);
    }
    static volumeCylinder(radius, height) {
        return Math.PI * Math.pow(radius, 2) * height;
    }
    static volumeCone(radius, height) {
        return (1 / 3) * Math.PI * Math.pow(radius, 2) * height;
    }
    static areaOfSphere(radius) {
        return 4 * Math.PI * Math.pow(radius, 2);
    }
    static SurfaceAreaOfCylinder(radius, height) {
        return 2 * Math.PI * radius * height + 2 * Math.PI * Math.pow(radius, 2);
    }
    static lateralSurfaceAreaOfCylinder(radius, height) {
        return 2 * Math.PI * radius * height;
    }
    static pythagoreanTheorem(a, b) {
        return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
    }
    static lateralHeightOfCone(radius, height) {
        return Math.sqrt(Math.pow(radius, 2) + Math.pow(height, 2));
    }
    static surfaceAreaOfCone(radius, height) {
        const l = this.lateralHeightOfCone(radius, height);
        return Math.PI * radius * (radius + l);
    }
    static lateralSurfaceAreaOfCone(radius, height) {
        const l = this.lateralHeightOfCone(radius, height);
        return Math.PI * radius * l;
    }
    static volumeOfHemisphere(radius) {
        return (2 / 3) * Math.PI * Math.pow(radius, 3);
    }
    static areaOfHemisphere(radius) {
        return 2 * Math.PI * Math.pow(radius, 2);
    }
    static areaOfCircle(radius) {
        return Math.PI * Math.pow(radius, 2);
    }
    static isPrime(x) {
        if (x <= 1)
            return false;
        const limit = Math.sqrt(x);
        for (let i = 2; i < limit; i++) {
            if (x % i === 0)
                return false;
        }
        return true;
    }
    static quadraticFormula(a, b, c) {
        let x1 = (-(b) + Math.sqrt((b ** 2) - 4 * a * c)) / (2 * a);
        let x2 = (-(b) - Math.sqrt((b ** 2) - 4 * a * c)) / (2 * a);
        return [x1, x2];
    }
    static simpleInterestP(I, r, t) {
        return I * (r / 100) * t
    }
    static simpleInterestI(P, r, t) {
        return (P * r * t) / 100;
    }
    static simpleInterestR(P, I, t) {
        return (I * 100) / P / t;
    }
    static simpleInterestT(P, I, r) {
        return (I * 100) / P / r
    }
    static Pi = Math.PI;
    static Pi1 = 3.142;
    static Pi2 = 22 / 7;
    static e = Math.E;

}
