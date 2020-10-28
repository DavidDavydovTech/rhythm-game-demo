import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { 
    Engine, 
    Scene, 
    FollowCamera, 
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
        // Create Canvas and attatch to the DOM
        var canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.id = "gameCanvas";
        document.body.appendChild(canvas);

        // Engine
        var engine = new Engine(canvas, true);
        // Scene
        var scene = new Scene(engine);
        scene.clearColor = new Color3(0, 0, 0); // Background color of black
        scene.ambientColor = new Color3(.1, .1, .1); // Full-bright mode
        // Camera
        var camera = new FollowCamera("FollowCam", new Vector3(0, 10, -10), scene);
        camera.radius = 30;
        // The goal height of camera above local origin (centre) of target
        camera.heightOffset = 10;
        // The goal rotation of camera around local origin (centre) of target in x y plane
        camera.rotationOffset = 0;
        // Acceleration of camera in moving from current to goal position
        camera.cameraAcceleration = 0.005
        // The speed at which acceleration is halted
        camera.maxCameraSpeed = 10

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
        camera.lockedTarget = player
        // Create a whirlpool points
        var points = [new Vector3(0,-1000,0)];
        var radius = 0.1;
        var angle = 0;
        for (var index = 0; index < 1000; index++) {
            points.push(new Vector3(radius * Math.cos(angle), 20 * Math.sin(index * 0.1), radius * Math.sin(angle)));
            radius += 0.3;
            angle += 0.1;
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
        var songTime = 218000; // Roughly the time it takes to play secret HIMITSU start to finish
        var mtiRatio = 0.0229357798165;
        var theta = Math.acos(Vector3.Dot(Axis.Z,normals[0]));
        scene.registerAfterRender(function() {
            songTime -= scene.getEngine().getDeltaTime();
            let estimatedPosition = songTime * mtiRatio;
            player.position = new Vector3(radius * Math.cos(angle), 20 * Math.sin(estimatedPosition * 0.02), radius * Math.sin(angle));
            radius = 0.06 * estimatedPosition;
            angle = 0.02 * estimatedPosition;

            // theta = Math.acos(Vector3.Dot(normals[i],normals[i+1]));
            // var dir = Vector3.Cross(normals[i],normals[i+1]).y;
            // var dir = dir/Math.abs(dir);
            // player.rotate(Axis.Y, dir * theta, Space.WORLD);
            
            i = (i + 1) % (points.length-1);	//continuous looping  
        });

        // Run the render-loop
        engine.runRenderLoop(() => {
            scene.render();
        });
    }
}
new App();