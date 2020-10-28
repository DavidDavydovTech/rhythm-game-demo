// Author: Unknown
// Source: https://doc.babylonjs.com/snippets/track
import { Matrix, Axis, Vector3 } from '@babylonjs/core';

const sectionData = function (startAt, options) {
    this.start = startAt;
    this.options = options;
}

const createTrack = function(points, sections) {
		
    var directions = [];
    var rotations = [];
    var carriageRotations = [];
    var passengerRotations = [];
    var nbSections = sections.length;
    
    var looped = (sections[nbSections - 1].start === 0);
    for(var i = 1; i < nbSections - looped; i++) {		
        if (sections[i - 1].start > sections[i].start) {
            console.log("sections not in order");
            return;
        }
    }
    if (0 < sections[nbSections - 1].start && sections[nbSections - 2].start > sections[nbSections - 1].start) {
        console.log("last section not in order");
            return;
    }
    var section = sections[0];
    if (section.start > 0) {
        startSection = new sectionData(0, {});
        sections.unshift(startSection);
        nbSections = sections.length;
    }
            
    if (0 < sections[nbSections - 1].start && sections[nbSections - 1].start < points.length - 1) { //assume need to close loop
        var endSection = new sectionData(0, sections[0].options);			
        sections.push(endSection);
    }
        
    for (var i = 0; i < sections.length - 1; i++) {            
        createSection(points, sections[i], sections[i + 1]);		
    }

    return {directions: directions, rotations:rotations, carriageRotations: carriageRotations, passengerRotations: passengerRotations}
    
    //Sections
    function createSection(points, startSection, endSection) {
        var railsFrom = startSection.start;
        var railsTo = endSection.start;
        if(endSection.start === 0) {
            railsTo = points.length;
        }
        
        var nbRails = railsTo - railsFrom; 
        
        var initialLean = (startSection.options.lean === void 0) ? 0 : startSection.options.lean; //lean of carriage about direction axis at start, a phi variable
        var initialTurn = (startSection.options.turn === void 0) ? 0 : startSection.options.turn; // turn of carriage around upright at start, a theta variable
        var leanTwists  = (startSection.options.leanTwists === void 0) ? 0 : startSection.options.leanTwists; //number of  lean twists (+ve counter clockwise, -ve clockwise)
        var leanWaves  = (startSection.options.leanWaves === void 0) ? 0 : startSection.options.leanWaves; //number of lean waves
        var leanWaveAngle  = (startSection.options.leanWaveAngle === void 0) ? 0 : startSection.options.leanWaveAngle; //angle for lean wave
        var turnTwists  = (startSection.options.turnTwists === void 0) ? 0 : startSection.options.turnTwists; //number of  turn twists (+ve counter clockwise, -ve clockwise)
        var turnWaves  = (startSection.options.turnWaves === void 0) ? 0 : startSection.options.turnWaves; //number of turn waves
        var turnWaveAngle  = (startSection.options.turnWaveAngle === void 0) ? 0 : startSection.options.turnWaveAngle; //angle for turn wave
        
        var finalLean = (endSection.options.lean === void 0) ? 0 : endSection.options.lean;
        var finalTurn = (endSection.options.turn === void 0) ? 0 : endSection.options.turn;
    
        //lean waves supersede lean twists unless leanWaveAngle = 0
        if (leanWaves > 0 && Math.abs(leanTwists) > 0) {
            if (leanWaveAngle == 0) {
                leanWaves = 0;
            }
            else {
                leanTwists = 0;
            }
        }
        
        //turn waves supersede turn twists unless turnWaveAngle = 0
        if (turnWaves > 0 && Math.abs(turnTwists) > 0) {
            if (turnWaveAngle == 0) {
                turnWaves = 0;
            }
            else {
                turnTwists = 0;
            }
        }
        
        //rail transformation
        var rotationMatrixY = Matrix.Identity();		
        var rotationMatrixZ = Matrix.Identity();		
        var rotationMatrix = Matrix.Identity();
        
        var tilt  = 0; //of rail rotation about (0, 0, 1) gives gradient
        var swivel = 0 //rotation of rail around (0, 1, 0)
        
        var deltaPhi = (finalLean  + 2 * leanTwists * Math.PI - initialLean) / (nbRails); //increase in phi per rail for lean twist		
        var deltaTheta = (finalTurn  + 2 * turnTwists * Math.PI - initialTurn) / (nbRails); //increase in theta per rail for lean twist		
        var phi = initialLean;
        var theta = initialTurn;
        var m = Matrix.Identity();
        var initialRailDirection = Axis.X;
        var initialUprightDirection = Axis.Y;
        var initialLevelDirection = Axis.Z;
        var railDirection = Vector3.Zero();
        var uprightDirection = Vector3.Zero();
        var levelDirection = Vector3.Zero();
        var leanDirection = Vector3.Zero();
        var turnDirection = Vector3.Zero();
        var carriageNormal = Vector3.Zero();
        Vector3.TransformNormalToRef(initialRailDirection, rotationMatrix, railDirection);
        var rotationMatrixLean = Matrix.Identity();
        var rotationMatrixTurn = Matrix.Identity();
        var rotationMatrixPassenger = Matrix.Identity();
        var initialPosition = Vector3.Zero();
        
        var normal = Vector3.Zero();
        var binormal = Vector3.Zero();
        
        var rotation = Matrix.Identity();
        var gradLean = (finalLean - initialLean) / (nbRails - 1); // lean gradient
        var gradTurn = (finalTurn - initialTurn) / (nbRails - 1); // turn gradient
        var railCount = 0;
        for (var i = railsFrom; i < railsTo; i++) {		
            points[(i + 1) % points.length].subtractToRef(points[i], railDirection);
            railDirection.normalize();			
            swivel = -Math.atan2(railDirection.z, railDirection.x);
            tilt = Math.atan2(Math.abs(railDirection.y), Math.abs(railDirection.x));
            tilt *= Math.sign(railDirection.y);
            Matrix.RotationAxisToRef(Axis.Y, swivel, rotationMatrixY);			
            Matrix.RotationAxisToRef(Axis.Z, tilt, rotationMatrixZ);			
            rotationMatrixZ.multiplyToRef(rotationMatrixY, rotationMatrix);
            Vector3.TransformNormalToRef(initialUprightDirection, rotationMatrix, uprightDirection);
            Vector3.TransformNormalToRef(initialLevelDirection, rotationMatrix, levelDirection);
            uprightDirection.normalize();
            levelDirection.normalize();
            
            if (leanWaves > 0) {
                phi = initialLean + railCount * gradLean + leanWaveAngle * Math.sin(railCount * leanWaves * Math.PI / (nbRails - 1));					
            }
            else {
                phi += deltaPhi;
            }
            if (turnWaves > 0) {
                theta = initialTurn + railCount * gradTurn + turnWaveAngle * Math.sin(railCount * turnWaves * Math.PI / (nbRails - 1));
            }
            else {
                theta += deltaTheta;
            }	
            railCount++;
            Matrix.RotationAxisToRef(railDirection, phi, rotationMatrixLean);
            Vector3.TransformNormalToRef(uprightDirection, rotationMatrixLean, carriageNormal);
            Matrix.RotationAxisToRef(carriageNormal, theta, rotationMatrixTurn);
            
            Matrix.RotationAxisToRef(initialUprightDirection, theta, rotationMatrixPassenger);
            passengerRotations.push(rotationMatrixPassenger.clone());
            
            rotationMatrix.multiplyToRef(rotationMatrixLean, rotation);
            carriageRotations.push(rotation.clone());
            rotation.multiplyToRef(rotationMatrixTurn, rotation);
            rotations.push(rotation.clone())
            
            directions.push(railDirection.clone());
        }
    }
    
    

}

export { createTrack };
