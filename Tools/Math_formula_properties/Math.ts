export class MathUtils {
    static MtoKM(a: number){
       return a / 1000;
    }

    static MtoCM(a: number){
        return a * 100;
    }

    static CMtoM(a: number){
        return a / 100;
    }

    static CMtoKM(a: number){
        return a * 100000;
    }

    static KMtoM(a: number){
        return a * 1000;
    }

    static volumeSphere(radius: number){
        return (4/3) * Math.PI * Math.pow(radius, 3);
    }

    static volumeCylinder(radius: number, height: number){
        return Math.PI * Math.pow(radius, 2) * height;
    }

    static volumeCone(radius: number, height: number){
        return (1/3) * Math.PI * Math.pow(radius, 2) * height;
    }

    static areaOfSphere(radius: number){
        return 4 * Math.PI * Math.pow(radius, 2);
    }

    static SurfaceAreaOfCylinder(radius: number, height: number){
        return 2 * Math.PI * radius * height + 2 * Math.PI * Math.pow(radius, 2);
    }

    static lateralSurfaceAreaOfCylinder(radius: number, height: number){
        return 2 * Math.PI * radius * height;
    }

    static pythagoreanTheorem(a: number, b: number){
        return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
    }

    static lateralHeightOfCone(radius: number, height: number){
        return Math.sqrt(Math.pow(radius, 2) + Math.pow(height, 2));
    }

    static surfaceAreaOfCone(radius: number, height: number){
        const l = this.lateralHeightOfCone(radius, height);
        return Math.PI * radius * (radius + l);
    }

    static lateralSurfaceAreaOfCone(radius: number, height: number){
        const l = this.lateralHeightOfCone(radius, height);
        return Math.PI * radius * l;
    }

    static volumeOfHemisphere(radius: number){
        return (2/3) * Math.PI * Math.pow(radius, 3);
    }

    static areaOfHemisphere(radius: number){
        return 2 * Math.PI * Math.pow(radius, 2);
    }

    static areaOfCircle(radius: number){
        return Math.PI * Math.pow(radius, 2);
    }

    static areaOfRectangle(length: number, width: number){
        return length * width;
    }

    static areaOfSquare(side: number){
        return Math.pow(side, 2);
    }
    
    static Pi = Math.PI;

    static e =  Math.E;

}