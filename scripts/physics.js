function checkCollision(objA, objB){
    var distanceXsqr = Math.pow(objA.pos.x - objB.pos.x,2)
    var distanceYsqr = Math.pow(objA.pos.y - objB.pos.y,2)
    var distance = Math.sqrt(distanceXsqr+distanceYsqr)
    
    if(distance < objA.radius + objB.radius){
        return true;
    }
    else {
        return false;
    }
}

function resolve(objA, objB){
    
    if(objA.hasControls && objA.collisionCooldown > 0) return;
    if(objB.hasControls && objB.collisionCooldown > 0) return;
    
    objA.pos = objA.lpos
    objB.pos = objB.lpos
    
    let xDistance = objB.pos.x - objA.pos.x
    let yDistance = objB.pos.y - objA.pos.y
    
    let normalVector = new Vector(xDistance, yDistance);
    normalVector.normalize();
    
    let tangentVector = new Vector(normalVector.y * -1, normalVector.x)
    
    let objAscalarNormal = normalVector.dot(objA.vel)
    let objBscalarNormal = normalVector.dot(objB.vel)
    
    let objAscalarTangential = tangentVector.dot(objA.vel)
    let objBscalarTangential = tangentVector.dot(objB.vel)

    let objAscalarNormalAfter = (objAscalarNormal * (objA.mass - objB.mass) + (2 * objB.mass * objBscalarNormal))/(objA.mass + objB.mass)
    let objBscalarNormalAfter = (objBscalarNormal * (objB.mass - objA.mass) + (2 * objA.mass * objAscalarNormal))/(objA.mass + objB.mass)
    
    //NOT OG
    objAscalarNormalAfter *= objA.ENTITY_ELASTICITY
    objBscalarNormalAfter *= objB.ENTITY_ELASTICITY
    
    let objAscalarNormalAfterVector = normalVector.multiply(objAscalarNormalAfter)
    let objBscalarNormalAfterVector = normalVector.multiply(objBscalarNormalAfter)
    
    let objAscalarNormalVector = tangentVector.multiply(objAscalarTangential)
    let objBscalarNormalVector = tangentVector.multiply(objBscalarTangential)
    
    objA.vel = objAscalarNormalVector.add(objAscalarNormalAfterVector)
    objB.vel = objBscalarNormalVector.add(objBscalarNormalAfterVector)
    
    objA.vel.subtractFrom(normalVector.divide(8));
    objB.vel.addTo(normalVector.divide(8));

    
    let pointOfContact = {x: objA.pos.x + normalVector.x, y: objA.pos.y + normalVector.y}
    let impactImpulseA = new Vector(objB.vel.x - objA.vel.x, objB.vel.y - objA.vel.y)
    let impactImpulseB = new Vector(objA.vel.x - objB.vel.x, objA.vel.y - objB.vel.y)
    if(objA.spin != undefined) spin(objA, pointOfContact, impactImpulseA);
    if(objB.spin != undefined) spin(objB, pointOfContact, impactImpulseB);
    
    objA.collided(pointOfContact.x, pointOfContact.y, impactImpulseA.getMagnitude() * 2);
    objB.collided(pointOfContact.x, pointOfContact.y, impactImpulseB.getMagnitude() * 2);
    
    function spin(obj, pointOfContact, impulseVector){
        let normalVector = new Vector(obj.pos.x - pointOfContact.x, obj.pos.y - pointOfContact.y);
        normalVector.normalize();
        let tangentVector = new Vector(normalVector.y * -1, normalVector.x);
        
        let angle = impulseVector.angleBetween(tangentVector);
        
        //Find out whether tangent is clockwise or counterclockwise
        let tangentScalar = Math.abs(Math.cos(angle) * impulseVector.getMagnitude());
        let tangentSpeed = tangentVector.multiply(tangentScalar);
        tangentSpeed = tangentSpeed.getMagnitude();
        
        let impulseAngleInDegrees = impulseVector.getAngle() * 180/Math.PI
        let normalAngleInDegrees = normalVector.getAngle() * 180/Math.PI
    
        let difference = differenceBetweenTwoAngles(impulseAngleInDegrees, normalAngleInDegrees);
        let differenceSign = -(Math.abs(difference)/difference) || 1;
        
        let spinDifference = (tangentSpeed * differenceSign) - obj.spin;
        obj.spin += spinDifference/2.3;
        
        let spinForce = tangentVector.multiply(spinDifference/4)
        obj.vel.subtractFrom(spinForce)
        
        if(isNaN(obj.spin)) debugger;
    }
    
    if(objA.hasControls) objA.collisionCooldown = 3;
    if(objB.hasControls) objB.collisionCooldown = 3;
}

function bounceOffWalls(obj, t){
    if(obj.pos.y + obj.radius > floorY){
        obj.pos = obj.lpos;
        
        let pointOfContact = {x: obj.pos.x, y: obj.pos.y + obj.radius};
        bounceOffPoint(obj, pointOfContact, obj.FLOOR_ELASTICITY, obj.FLOOR_RESISTANCE);
    }
    
    if(obj.pos.x + obj.radius > wallRight){
        obj.pos = obj.lpos;
        
        let pointOfContact = {x: obj.pos.x + obj.radius, y: obj.pos.y};
        bounceOffPoint(obj, pointOfContact, obj.WALL_ELASTICITY, obj.WALL_RESISTANCE);
    }
    
    if(obj.pos.x - obj.radius < wallLeft){
        obj.pos = obj.lpos;
        
        let pointOfContact = {x: obj.pos.x - obj.radius, y: obj.pos.y};
        bounceOffPoint(obj, pointOfContact, obj.WALL_ELASTICITY, obj.WALL_RESISTANCE);
    }
    
    if(obj.pos.y > centerWallHeight){
        if(obj.lpos.x + obj.radius <= centerWallLeft && obj.pos.x + obj.radius > centerWallLeft){
            obj.pos.x = centerWallLeft - obj.radius;
            
            let pointOfContact = {x: obj.pos.x + obj.radius, y: obj.pos.y};
            bounceOffPoint(obj, pointOfContact, obj.WALL_ELASTICITY, obj.WALL_RESISTANCE);
        }
        if(obj.lpos.x - obj.radius >= centerWallRight && obj.pos.x - obj.radius < centerWallRight){
            obj.pos.x = centerWallRight + obj.radius;
            
            let pointOfContact = {x: obj.pos.x - obj.radius, y: obj.pos.y};
            bounceOffPoint(obj, pointOfContact, obj.WALL_ELASTICITY, obj.WALL_RESISTANCE);
        }
    }
    
    let centerWallBall = {pos: {x: 160, y: centerWallHeight}, radius: centerWallBallRadius};
    if(checkCollision(centerWallBall, obj) == true){
        obj.pos = obj.lpos;
        let normalVector = new Vector(centerWallBall.pos.x - obj.pos.x, centerWallBall.pos.y - obj.pos.y);
        normalVector.normalize();
        let offsetVector = normalVector.multiply(obj.radius);
        let pointOfContact = {x: obj.pos.x + offsetVector.x, y: obj.pos.y + offsetVector.y};
        bounceOffPoint(obj, pointOfContact, obj.WALL_ELASTICITY, obj.WALL_RESISTANCE, true);
    }
}

function bounceOffPoint(obj, pointOfContact, elasticity, resistance, wasOffCenterWall){
    
    let impulseVector = new Vector(obj.vel.x * -1, obj.vel.y * -1);
    obj.collided(pointOfContact.x, pointOfContact.y, impulseVector.getMagnitude(), wasOffCenterWall);
    applyImpulse(obj, pointOfContact, impulseVector, elasticity, resistance);
}

function applyImpulse(obj, pointOfContact, impulseVector, elasticity, resistance){
    let normalVector = new Vector(obj.pos.x - pointOfContact.x, obj.pos.y - pointOfContact.y);
    normalVector.normalize();
    let tangentVector = new Vector(normalVector.y * -1, normalVector.x);
    
    let angle = impulseVector.angleBetween(tangentVector);
    let normalScalar = Math.abs(Math.sin(angle) * impulseVector.getMagnitude());
    
    obj.vel.addTo(normalVector.multiply(normalScalar));
    obj.vel.addTo(normalVector.multiply(normalScalar * elasticity));
    
    //Find out whether tangent is clockwise or counterclockwise
    let tangentScalar = Math.abs(Math.cos(angle) * impulseVector.getMagnitude());
    let tangentSpeed = tangentVector.multiply(tangentScalar);
    tangentSpeed = tangentSpeed.getMagnitude();
    
    let impulseAngleInDegrees = impulseVector.getAngle() * 180/Math.PI
    let normalAngleInDegrees = normalVector.getAngle() * 180/Math.PI

    let difference = differenceBetweenTwoAngles(impulseAngleInDegrees, normalAngleInDegrees);
    let differenceSign = -(Math.abs(difference)/difference) || 1;
    
    let spinDifference = (tangentSpeed * differenceSign) - obj.spin;
    obj.spin += spinDifference/5;
    
    let spinForce = tangentVector.multiply(spinDifference/6)
    obj.vel.subtractFrom(spinForce)
    
    obj.spin *= resistance;
    
    if(isNaN(obj.spin)) debugger;
}

function applyTerminalVelocityX(obj){
    let currentVel = Math.abs(obj.vel.x);
    let velSign = Math.abs(obj.vel.x)/obj.vel.x;
    let targetVel = 0;
    if(currentVel > obj.TERM_VEL){
        targetVel = currentVel - (currentVel - obj.TERM_VEL)/3
        obj.vel.x = targetVel * velSign;
    }
}

function pushApart(objA, objB){
    var d = Math.sqrt(Math.abs(Math.pow(objA.pos.x - objB.pos.x, 2)) + Math.abs(Math.pow(objA.pos.y - objB.pos.y, 2)))
    if(d < objA.radius + objB.radius){
        
        var normal = new Vector(objA.pos.x - objB.pos.x, objA.pos.y - objB.pos.y)
        normal.setMagnitude(objA.radius + objB.radius + 0.05);
        
        let originalAPos = {x: objA.pos.x, y: objA.pos.y};
        let originalBPos = {x: objB.pos.x, y: objB.pos.y};
        
        objB.pos.x = originalAPos.x - normal.x;
        objB.pos.y = originalAPos.y - normal.y;
        objB.vel.addTo(normal.multiply(-0.001));
        
        objA.pos.x = originalBPos.x + normal.x;
        objA.pos.y = originalBPos.y + normal.y;
        objA.vel.addTo(normal.multiply(0.001));
    }
}