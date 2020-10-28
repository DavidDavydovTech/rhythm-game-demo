import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { 
    Engine, 
    Scene, 
    ArcRotateCamera, 
    Vector3, 
    HemisphericLight, 
    Mesh, 
    MeshBuilder, 
    Path3D, 
    Color3,
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
        scene.clearColor = new Color3(0, 0, 0);
        // Camera
        var camera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), scene);
        camera.setPosition(new Vector3(20, 200, 400));
        camera.maxZ = 20000;
        camera.lowerRadiusLimit = 150;
        camera.attachControl(canvas, true);

        var light1 = new HemisphericLight("light1", new Vector3(5, 5, 0), scene);
        var sphere = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);

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
        // Create a whirlpool
        var points = [];

        var radius = 0.5;
        var angle = 0;
        for (var index = 0; index < 1000; index++) {
            points.push(new Vector3(radius * Math.cos(angle), 10 * Math.sin(index * 0.1), radius * Math.sin(angle)));
            radius += 0.3;
            angle += 0.1;
        }

        var whirlpool = Mesh.CreateLines("whirlpool", points, scene, true);
        whirlpool.color = new Color3(1, 1, 1);

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

        // Run the render-loop
        engine.runRenderLoop(() => {
            scene.render();
        });
    }
}
new App();