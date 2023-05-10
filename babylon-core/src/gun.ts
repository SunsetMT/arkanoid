import {Mesh, MeshBuilder, PhysicsImpostor, Scene, StandardMaterial, Vector3} from "babylonjs";
import {Counter} from "./counter";
import {COLLISION_GROUPS} from "./collision-groups";

export class Gun {
    paddlePositionX: number;

    constructor(paddle: Mesh, bulletMaterial: StandardMaterial, cubesArray: PhysicsImpostor[],
                bulletsArray: PhysicsImpostor[], wallTop: Mesh, scene: Scene, intervalId: Counter) {
        scene.registerBeforeRender(() => {
            this.paddlePositionX = paddle.getAbsolutePosition().x;
        })


        const interval = setInterval(() => {
            const leftBullet = MeshBuilder.CreateBox('box', { width: 0.05, height: 1, depth: 0.1 }, scene);
            const leftSpawnOffset = paddle.getBoundingInfo().boundingBox.extendSize.x * paddle.scaling.x - 0.07;
            leftBullet.setAbsolutePosition(new Vector3(this.paddlePositionX - leftSpawnOffset,
                0.9, paddle.getAbsolutePosition().z - 0.5));
            leftBullet.physicsImpostor = new PhysicsImpostor(leftBullet, PhysicsImpostor.BoxImpostor,
                { mass: 1, restitution: 1, friction: 0 });
            leftBullet.physicsImpostor.physicsBody.collisionFilterGroup = COLLISION_GROUPS.BULLETS;
            leftBullet.physicsImpostor.physicsBody.collisionFilterMask = COLLISION_GROUPS.BLOCKS | COLLISION_GROUPS.WALLS;
            leftBullet.physicsImpostor.wakeUp();
            leftBullet.physicsImpostor.setLinearVelocity(new Vector3(0, 0, -10));
            leftBullet.material = bulletMaterial;
            bulletsArray.push(leftBullet.physicsImpostor);

            leftBullet.physicsImpostor.registerOnPhysicsCollide(cubesArray, () => {
                leftBullet.dispose();
            });

            leftBullet.physicsImpostor.registerOnPhysicsCollide(wallTop.physicsImpostor, () => {
                leftBullet.dispose()
            });


            const rightBullet = MeshBuilder.CreateBox('box', { width: 0.05, height: 1, depth: 0.1 }, scene);
            const rightSpawnOffset = paddle.getBoundingInfo().boundingBox.extendSize.x * paddle.scaling.x - 0.07;
            rightBullet.setAbsolutePosition(new Vector3(this.paddlePositionX + rightSpawnOffset,
                0.9, paddle.getAbsolutePosition().z - 0.5));
            rightBullet.physicsImpostor = new PhysicsImpostor(rightBullet, PhysicsImpostor.BoxImpostor,
                { mass: 1, restitution: 1, friction: 0 });
            rightBullet.physicsImpostor.physicsBody.collisionFilterGroup = COLLISION_GROUPS.BULLETS;
            rightBullet.physicsImpostor.physicsBody.collisionFilterMask = COLLISION_GROUPS.BLOCKS | COLLISION_GROUPS.WALLS;
            rightBullet.physicsImpostor.wakeUp();
            rightBullet.physicsImpostor.setLinearVelocity(new Vector3(0, 0, -10));
            rightBullet.material = bulletMaterial;
            bulletsArray.push(rightBullet.physicsImpostor);

            rightBullet.physicsImpostor.registerOnPhysicsCollide(cubesArray, () => {
                rightBullet.dispose();
            });

            rightBullet.physicsImpostor.registerOnPhysicsCollide(wallTop.physicsImpostor, () => {
                rightBullet.dispose();
            })
        }, 500);

        scene.onDisposeObservable.add(() => {
            clearInterval(interval);
        });
        intervalId.setValue(interval);

        setTimeout(() => clearInterval(interval), 10000);
    }
}
