import {Engine, Render, Runner, Bodies, World, Body, Events} from "matter-js";
import { PLANETS } from "./planets";

const engine = Engine.create();
const render = Render.create({
    engine,
    element: document.body,
    options: {
        wireframes: false,
        background: "#CCCFFF",
        width: 600,
        height: 880
    }
});

const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 880, {  // rectangle(x축, y축, 너비(width), 높이(height))
    isStatic: true,  // isStatic 미설정시(false) 벽이 아래로 내려감
    render: {fillStyle: "#FFFCCC"}
});

const rightWall = Bodies.rectangle(585, 395, 30, 880, {
    isStatic: true,  // isStatic 미설정시(false) 벽이 아래로 내려감
    render: {fillStyle: "#FFFCCC"}
});

const ground = Bodies.rectangle(310, 860, 620, 50, {
    isStatic: true,  // isStatic 미설정시(false) 벽이 아래로 내려감
    render: {fillStyle: "#FFFCCC"}
});

const topLine = Bodies.rectangle(310, 160, 620, 2, {
    name: "topLine",
    isStatic: true,  // isStatic 미설정시(false) 벽이 아래로 내려감
    isSensor: true,  // 부딪히지 않고 감지만 한다.
    render: {fillStyle: "#FF0000"}
});

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentPlanet = null;
let disableAction = false;
let interval = null;
let num_sun = 0;

function addPlanet(){
    const index = Math.floor(Math.random() * 5);
    const planet = PLANETS[index];

    const body = Bodies.circle(310, 77, planet.radius, {
        index: index,
        isSleeping: true,  // 반투명상태로 떨어지지않고 대기
        render: {
            sprite: {texture: `${planet.name}.png`}
        },
        restitution: 0.2
    });

    currentBody = body;
    currentPlanet = planet;

    World.add(world, body);
}

window.onkeydown = (event)=>{
    if(disableAction){
        return;
    }

    switch(event.code){
        case "ArrowLeft":
            if(interval)
                return;
            interval = setInterval(()=>{
                if(currentBody.position.x - currentPlanet.radius > 30)
                    Body.setPosition(currentBody, {
                        x: currentBody.position.x - 1,
                        y: currentBody.position.y
                    });
            }, 5);

            break;

        case "ArrowRight":
            if(interval)
                return;
            interval = setInterval(()=>{
                if(currentBody.position.x + currentPlanet.radius < 570)
                    Body.setPosition(currentBody, {
                        x: currentBody.position.x + 1,
                        y: currentBody.position.y
                    });
            }, 5);
            
            break;

        case "ArrowDown":
            currentBody.isSleeping = false;
            disableAction = true;

            setTimeout(() => {
                addPlanet();
                disableAction = false;
            }, 1300);

            break;
    }
}

window.onkeyup = (event)=>{
    switch (event.code) {
        case "ArrowLeft":
        case "ArrowRight":
            clearInterval(interval);
            interval = null;
    }
}

Events.on(engine, "collisionStart", (event)=>{
    event.pairs.forEach((collision)=>{
        if(collision.bodyA.index === collision.bodyB.index){
            World.remove(world, [collision.bodyA, collision.bodyB]);
            const index = collision.bodyA.index;

            if(index === PLANETS.length - 1){
                // console.log(`num_sun1 = ` + num_sun);  // 0
                // console.log(`index1 = ` + index);  // 8
                num_sun++;
                // console.log(`num_sun2 = ` + num_sun);  // 1
                // console.log(`index2 = ` + index);  // 8
                if(num_sun > 0){
                    alert("CLEAR!");
                    location.reload();
                }
                else{
                    return;
                }
            }

            

            const newPlanet = PLANETS[index + 1];

            const newBody = Bodies.circle(
                collision.collision.supports[0].x,  // collision.collision.supports[0] 는 부딪힌 지점
                collision.collision.supports[0].y,
                newPlanet.radius,
                {
                    render: {
                        sprite: {texture: `${newPlanet.name}.png`}
                    },
                    index: index + 1
                }
            );

            World.add(world, newBody);

        }

        if(!disableAction && (collision.bodyA.name === "topLine" || collision.bodyB.name === "topLine")){
            alert("GAME OVER");
            location.reload();
        }
    });
});

addPlanet();