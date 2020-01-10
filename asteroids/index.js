const b2Vec2 = Box2D.Common.Math.b2Vec2;
const b2BodyDef = Box2D.Dynamics.b2BodyDef;
const b2Body = Box2D.Dynamics.b2Body;
const b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
const b2Fixture = Box2D.Dynamics.b2Fixture;
const b2World = Box2D.Dynamics.b2World;
const b2MassData = Box2D.Collision.Shapes.b2MassData;
const b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
const b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
const b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

const canvas = document.getElementById("myCanvas");
const g = canvas.getContext("2d");
let oldTime;
const keyPress = {};
const world = new b2World(new b2Vec2(0, 0), true);
const bodyDef = new b2BodyDef;
const fixDef = new b2FixtureDef;
fixDef.density = 1.0;
fixDef.friction = 0.5;
fixDef.restitution = 0.2;
const xMin = 0;
const xMax = 30;
const yMin = 0;
const yMax = 20;
const entityList = [];
let weaponCoolDown = 0;

//create some objects
bodyDef.type = b2Body.b2_dynamicBody;
for (var i = 0; i < 10; i++) {
    if (Math.random() > 0.5) {
        fixDef.shape = new b2PolygonShape;
        fixDef.shape.SetAsBox(
            Math.random() + 0.1 //half width
            , Math.random() + 0.1 //half height
        );
    } else {
        fixDef.shape = new b2CircleShape(
            Math.random() + 0.1 //radius
        );
    }
    bodyDef.position.x = Math.random() * 10;
    bodyDef.position.y = Math.random() * 10;
    const entity = world.CreateBody(bodyDef).CreateFixture(fixDef);
    entityList.push(entity);
}

//create player
bodyDef.position.x = 10;
bodyDef.position.y = 10;
fixDef.shape = new b2PolygonShape;
// fixDef.shape.SetAsBox(0.5, 0.5);
fixDef.shape.SetAsArray([new b2Vec2(0, 0), new b2Vec2(1.5, 0.5), new b2Vec2(0, 1)], 3);

const player = world.CreateBody(bodyDef).CreateFixture(fixDef);
entityList.push(player);

const debugDraw = new b2DebugDraw();
debugDraw.SetSprite(g);
debugDraw.SetDrawScale(30.0);
debugDraw.SetFillAlpha(0.3);
debugDraw.SetLineThickness(1.0);
debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
world.SetDebugDraw(debugDraw);

const v = new b2Vec2(1, 0);

const gameLoop = (newTime) => {
    const deltaTime = newTime - oldTime;
    const playerAngle = player.GetBody().GetAngle();
    const playerDirection = new b2Vec2(Math.cos(playerAngle), Math.sin(playerAngle));
    const rotationPower = 1.0;
    const forwardPower = 2.0;

    if (keyPress["w"]) {
        const angle = player.GetBody().GetAngle();
        const forceVector = playerDirection.Copy()
        forceVector.Multiply(forwardPower);
        player.GetBody().ApplyForce(forceVector, player.GetBody().GetWorldCenter());
    }

    if (keyPress["s"]) {
        const forceVector = playerDirection.GetNegative().Copy()
        forceVector.Multiply(forwardPower);
        player.GetBody().ApplyForce(forceVector, player.GetBody().GetWorldCenter());
    }

    if (keyPress["a"]) {
        player.GetBody().ApplyTorque(-rotationPower);
    }

    if (keyPress["d"]) {
        player.GetBody().ApplyTorque(+rotationPower);
    }

    weaponCoolDown -= deltaTime;

    if (keyPress[" "]) {
        if (weaponCoolDown < 0) {
            fixDef.shape = new b2CircleShape(0.1);
            const bullet = world.CreateBody(bodyDef).CreateFixture(fixDef);
            const bulletDirection = new b2Vec2(Math.cos(playerAngle), Math.sin(playerAngle));
            const bulletVelocity = bulletDirection.Copy();
            const bulletPower = 10.0;
            bulletVelocity.Multiply(bulletPower);
            bullet.GetBody().SetLinearVelocity(bulletVelocity);
            bullet.GetBody().SetPosition(player.GetBody().GetPosition());
            bullet.GetBody().SetAngle(player.GetBody().GetAngle());
            weaponCoolDown = 1000;
        }
    }

    entityList.forEach(entity => {
        const body = entity.GetBody();
        const position = body.GetPosition();
        let x = position.x;
        let y = position.y;

        if (x < xMin) {
            x = xMax;
        }

        if (x > xMax) {
            x = xMin;
        }

        if (y < yMin) {
            y = yMax;
        }

        if (y > yMax) {
            y = yMin;
        }

        body.SetPosition(new b2Vec2(x, y));
    });

    world.Step(deltaTime * 0.001, 10, 10);
    world.DrawDebugData();
    world.ClearForces();

    oldTime = newTime;
    window.requestAnimationFrame(gameLoop);
};

//initiate loop
window.requestAnimationFrame((newTime) => {
    oldTime = newTime;
    window.requestAnimationFrame(gameLoop);
});

document.addEventListener('keypress', (e) => {
    keyPress[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keyPress[e.key] = false;
});
