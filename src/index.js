import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { 
    Engine, 
    Scene, 
    ArcRotateCamera, 
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
        var camera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), scene);
        camera.setPosition(new Vector3(20, 200, 400));
        camera.maxZ = 20000;
        camera.lowerRadiusLimit = 150;
        camera.attachControl(canvas, true);
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
        var points = [new Vector3(0,-1000,0)];
        var radius = 0.1;
        var angle = 0;
        for (var index = 0; index < 5000; index++) {
            points.push(new Vector3(radius * Math.cos(angle), 20 * Math.sin(index * 0.02), radius * Math.sin(angle)));
            radius += 0.06;
            angle += 0.02;
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
        var theta = Math.acos(Vector3.Dot(Axis.Z,normals[0]));
        scene.registerAfterRender(function() {
           player.position.x = points[i].x;
           player.position.y = points[i].y;
           player.position.z = points[i].z;
      
           theta = Math.acos(Vector3.Dot(normals[i],normals[i+1]));
           var dir = Vector3.Cross(normals[i],normals[i+1]).y;
           var dir = dir/Math.abs(dir);
           player.rotate(Axis.Y, dir * theta, Space.WORLD);
           
           i = (i + 1) % (points.length-1);	//continuous looping  
        });

        // Run the render-loop
        engine.runRenderLoop(() => {
            scene.render();
        });
    }
}
new App();