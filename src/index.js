import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { 
    Engine, 
    Scene, 
    UniversalCamera, 
    Vector3, 
    Mesh, 
    MeshBuilder, 
    Path3D, 
    Color3,
    StandardMaterial,
    Space,
    Axis,
    VertexBuffer,
} from "@babylonjs/core";
import { sectionData, createTrack } from './lib/createTrack';

class App {
    constructor() {
        document.body.style.margin = "0px";
        document.body.style.overflow = "hidden";
        // Create Canvas and attatch to the DOM
        var canvas = document.createElement("canvas");
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";
        canvas.id = "gameCanvas";
        document.body.appendChild(canvas);

        // Engine
        var engine = new Engine(canvas, true);
        // Scene
        var scene = new Scene(engine);
        scene.clearColor = new Color3(0, 0, 0); // Background color of black
        scene.ambientColor = new Color3(.1, .1, .1); // Full-bright mode
        // Camera
 
        // Parameters : name, position, scene
        var camera = new UniversalCamera("UniversalCamera", new Vector3(50, 0, 50), scene);
        camera.setTarget(Vector3.Zero());
        // camera.attachControl(canvas, true);

        // Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
                if (scene.debugLayer.isVisible()) {
                    scene.debugLayer.hide();
                } else {
                    scene.debugLayer.show();
                }
            }
        });
        // Materials ('fb' stands for full-bright)
        var fbRed = new StandardMaterial("mat1", scene);
        fbRed.ambientColor = new Color3(10, .5, .5);
        // Create the sphere riding the track
        var player = MeshBuilder.CreateSphere("player", {diameter: 3, diameterX: 3, segments: 8}, scene);
        player.material = fbRed;
        // Create a whirlpool points
        var points = [];
        var radius = 0.1;
        var angle = 0;
        for (var index = 0; index < 2000; index++) {
            points.push(new Vector3(radius * Math.cos(angle), 20 * Math.sin(index * 0.05), radius * Math.sin(angle)));
            radius += 0.15;
            angle += 0.05;
        }
        points = points.reverse();
        // Move player to the start of the track
        player.position = points[points.length - 1];
        // Create track data
        var path3d = new Path3D(points);
        var normals = path3d.getNormals();
        // Create a whirlpool mesh out of the points
        var whirlpool = Mesh.CreateLines("whirlpool", points, scene, true);
        whirlpool.color = new Color3(1, 1, 1);

        // Animate it
        // var positionData = whirlpool.getVerticesData(VertexBuffer.PositionKind);
        // var heightRange = 10;
        // var alpha = 0;

        // scene.registerBeforeRender(function() {
        //     for (var index = 0; index < 1000; index++) {
        //         positionData[index * 3 + 1] = heightRange * Math.sin(alpha + index * 0.1);
        //     }

        //     whirlpool.updateVerticesData(VertexBuffer.PositionKind, positionData);

        //     alpha += 0.05 * scene.getAnimationRatio();
        // });

        var i=0;
        var songTime = 225000; // Roughly the time it takes to play secret HIMITSU start to finish + 7 seconds
        var mtiRatio = 0.0229357798165;
        var totalTime = 0;
        var theta = Math.acos(Vector3.Dot(Axis.Z,normals[0]));
        let did = false;
        scene.registerAfterRender(function() {
            totalTime += scene.getEngine().getDeltaTime();
            let estimatedPosition = (songTime - totalTime) * mtiRatio;
            radius = 0.06 * estimatedPosition;
            angle = 0.02 * estimatedPosition;

            let currentX = radius * Math.cos(angle)
            let currentY = 20 * Math.sin(estimatedPosition * 0.02)
            let currentZ = radius * Math.sin(angle)
            let newPosition = new Vector3(currentX, currentY, currentZ);
            player.position = newPosition;
            
            camera.setTarget(newPosition);
            camera.position.x -= (camera.position.x - player.position.x + 20) / 25
            camera.position.y -= (camera.position.y - player.position.y - 20) / 25
            camera.position.z -= (camera.position.z - player.position.z + 20) / 25
            if (!did) {
                did = true; 
                console.log(player.position);
            }
        });

        // Run the render-loop
        engine.runRenderLoop(() => {
            scene.render();
        });
    }
}

const easeOutBack = (x) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;

    return 1 + c3 * pow(x - 1, 3) + c1 * pow(x - 1, 2);
}

new App();